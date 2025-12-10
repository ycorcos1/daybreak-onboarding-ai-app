module Mutations
  class SubmitReferral < Mutations::BaseMutation
    argument :referral_id, ID, required: true

    field :referral, Types::ReferralType, null: true
    field :errors, [String], null: false

    def resolve(referral_id:)
      require_parent!

      referral = current_user.referrals.find_by(id: referral_id)
      return { referral: nil, errors: ["Referral not found"] } unless referral

      unless referral.status == "draft"
        return { referral: nil, errors: ["Referral is not in draft status"] }
      end

      unless referral.ready_for_submission?
        return { referral: nil, errors: referral.errors.full_messages }
      end

      Referral.transaction do
        referral.update!(status: "submitted", submitted_at: Time.current)
        referral.generate_packet!
      end

      Notifications::Dispatcher.referral_submitted(referral: referral, user: current_user)

      { referral: referral.reload, errors: [] }
    rescue StandardError => e
      { referral: nil, errors: [e.message] }
    end
  end
end


