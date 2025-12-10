module Mutations
  class UpdateChildInfo < Mutations::BaseMutation
    argument :referral_id, ID, required: true
    argument :child_input, Types::Inputs::ChildInput, required: true

    field :child, Types::ChildType, null: true
    field :referral, Types::ReferralType, null: true
    field :errors, [String], null: false

    def resolve(referral_id:, child_input:)
      require_parent!

      referral = current_user.referrals.find_by(id: referral_id)
      return { child: nil, referral: nil, errors: ["Referral not found"] } unless referral

      child = referral.child

      if child.update(child_input.to_h.compact)
        referral.update(
          last_completed_step: "child-info",
          last_updated_step_at: Time.current
        )
        { child: child, referral: referral, errors: [] }
      else
        { child: nil, referral: referral, errors: child.errors.full_messages }
      end
    end
  end
end
