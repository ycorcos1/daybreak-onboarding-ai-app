module Mutations
  class LogoutParent < Mutations::BaseMutation
    field :success, Boolean, null: false

    def resolve
      context[:session].delete(:user_id)
      { success: true }
    end
  end
end

