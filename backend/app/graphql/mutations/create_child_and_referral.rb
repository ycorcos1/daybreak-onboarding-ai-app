module Mutations
  class CreateChildAndReferral < Mutations::BaseMutation
    argument :child_input, Types::Inputs::ChildInput, required: true

    field :child, Types::ChildType, null: true
    field :referral, Types::ReferralType, null: true
    field :errors, [String], null: false

    def resolve(child_input:)
      require_parent!

      child = current_user.children.build(child_input.to_h)
      referral = child.referrals.build(status: "draft", last_completed_step: nil)

      if child.save && referral.save
        Notifications::Dispatcher.referral_created(referral: referral, user: current_user)
        { child: child, referral: referral, errors: [] }
      else
        { child: nil, referral: nil, errors: child.errors.full_messages + referral.errors.full_messages }
      end
    end
  end
end


