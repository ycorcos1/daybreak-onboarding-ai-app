module Mutations
  class AppendScreenerMessage < Mutations::BaseMutation
    argument :referral_id, ID, required: true
    argument :parent_message, String, required: true

    field :session, Types::AiScreenerSessionType, null: true
    field :ai_reply, String, null: true
    field :crisis_detected, Boolean, null: false
    field :errors, [String], null: false

    def resolve(referral_id:, parent_message:)
      require_parent!

      referral = current_user.referrals.find_by(id: referral_id)
      return { session: nil, ai_reply: nil, crisis_detected: false, errors: ["Referral not found"] } unless referral

      session = referral.ai_screener_session || referral.create_ai_screener_session!
      return { session: session, ai_reply: nil, crisis_detected: false, errors: ["Screener is already completed"] } if session.completed?

      transcript = Array(session.transcript_jsonb).dup
      transcript << build_message(role: "user", content: parent_message)

      safety = Ai::SafetyGuard.evaluate(parent_message)
      crisis_detected = safety[:risk_level] == :crisis
      high_risk_detected = safety[:risk_level] == :high_risk

      if crisis_detected
        ai_reply = Ai::SafetyGuard.emergency_message
        transcript << build_message(role: "assistant", content: ai_reply, crisis: true)
        session.update!(transcript_jsonb: transcript, risk_flag: true)
        referral.update!(risk_flag: true) unless referral.risk_flag?

        return { session: session, ai_reply: ai_reply, crisis_detected: true, errors: [] }
      end

      if high_risk_detected
        session.risk_flag = true
        referral.update!(risk_flag: true) unless referral.risk_flag?
      end

      ai_reply = Ai::OpenaiProvider.new.generate_screener_reply(
        conversation_history: transcript,
        parent_message: parent_message
      )
      transcript << build_message(role: "assistant", content: ai_reply)

      session.update!(transcript_jsonb: transcript, risk_flag: session.risk_flag)

      { session: session, ai_reply: ai_reply, crisis_detected: false, errors: [] }
    rescue Ai::ProviderError
      { session: session, ai_reply: nil, crisis_detected: crisis_detected || false, errors: ["AI response is unavailable right now. Please try again."] }
    rescue StandardError => e
      { session: nil, ai_reply: nil, crisis_detected: crisis_detected || false, errors: [e.message] }
    end

    private

    def build_message(role:, content:, crisis: false)
      {
        role: role,
        content: content,
        crisis: crisis,
        timestamp: Time.current.iso8601
      }
    end
  end
end


