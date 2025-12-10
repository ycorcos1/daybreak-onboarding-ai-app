module Mutations
  class UpdateParentInfo < Mutations::BaseMutation
    argument :referral_id, ID, required: true
    argument :parent_info, Types::Inputs::ParentInfoInput, required: true

    field :user, Types::UserType, null: true
    field :referral, Types::ReferralType, null: true
    field :errors, [String], null: false

    def resolve(referral_id:, parent_info:)
      require_parent!

      referral = current_user.referrals.find_by(id: referral_id)
      return { user: nil, referral: nil, errors: ["Referral not found"] } unless referral

      if current_user.update(parent_info.to_h.compact)
        referral.update(
          last_completed_step: "parent-info",
          last_updated_step_at: Time.current
        )
        { user: current_user, referral: referral, errors: [] }
      else
        { user: nil, referral: nil, errors: current_user.errors.full_messages }
      end
    end
  end
end
