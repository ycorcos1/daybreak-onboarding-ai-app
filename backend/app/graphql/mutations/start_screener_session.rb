module Mutations
  class StartScreenerSession < Mutations::BaseMutation
    argument :referral_id, ID, required: true

    field :session, Types::AiScreenerSessionType, null: true
    field :errors, [String], null: false

    def resolve(referral_id:)
      require_parent!

      referral = current_user.referrals.find_by(id: referral_id)
      return { session: nil, errors: ["Referral not found"] } unless referral

      session = referral.ai_screener_session || referral.build_ai_screener_session
      session.transcript_jsonb ||= []
      session.summary_jsonb ||= {}
      session.risk_flag = session.risk_flag || false

      session.save! if session.new_record? || session.changed?

      { session: session, errors: [] }
    rescue StandardError => e
      { session: nil, errors: [e.message] }
    end
  end
end


