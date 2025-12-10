module Mutations
  class CompleteScreener < Mutations::BaseMutation
    MIN_USER_MESSAGES = 3

    argument :referral_id, ID, required: true

    field :session, Types::AiScreenerSessionType, null: true
    field :errors, [String], null: false

    def resolve(referral_id:)
      require_parent!

      referral = current_user.referrals.find_by(id: referral_id)
      return { session: nil, errors: ["Referral not found"] } unless referral

      session = referral.ai_screener_session
      return { session: nil, errors: ["Screener session not started"] } unless session
      return { session: session, errors: ["Screener is already completed"] } if session.completed?

      transcript = Array(session.transcript_jsonb)
      user_message_count = transcript.count { |m| (m["role"] || m[:role]) == "user" }
      if user_message_count < MIN_USER_MESSAGES
        return {
          session: session,
          errors: ["Please continue the conversation a bit more (at least 3 messages) before finishing."]
        }
      end

      provider = Ai::OpenaiProvider.new
      summary = provider.generate_screener_summary(conversation_history: transcript)

      session.summary_jsonb = summary.presence || {}
      session.completed_at = Time.current
      session.save!

      referral.update!(last_completed_step: "screener", last_updated_step_at: Time.current)

      { session: session, errors: [] }
    rescue Ai::ProviderError
      if session
        session.update!(summary_jsonb: session.summary_jsonb.presence || {}, completed_at: Time.current)
        referral.update!(last_completed_step: "screener", last_updated_step_at: Time.current) if referral
      end

      { session: session, errors: ["We couldn't finish the summary right now. Please try again."] }
    rescue StandardError => e
      { session: session, errors: [e.message] }
    end
  end
end


