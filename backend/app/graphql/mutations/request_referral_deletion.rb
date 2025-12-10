module Mutations
  class RequestReferralDeletion < Mutations::BaseMutation
    argument :referral_id, ID, required: true

    field :referral, Types::ReferralType, null: true
    field :errors, [String], null: false

    def resolve(referral_id:)
      require_parent!

      referral = current_user.referrals.find_by(id: referral_id)
      return { referral: nil, errors: ["Referral not found"] } unless referral

      if referral.update(deletion_requested_at: Time.current)
        Notifications::Dispatcher.deletion_requested(referral: referral, admin_user: nil)

        { referral: referral, errors: [] }
      else
        { referral: nil, errors: referral.errors.full_messages }
      end
    end
  end
end


