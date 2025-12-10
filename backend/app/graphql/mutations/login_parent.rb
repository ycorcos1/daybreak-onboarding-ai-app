module Mutations
  class LoginParent < Mutations::BaseMutation
    argument :email, String, required: true
    argument :password, String, required: true

    field :user, Types::UserType, null: true
    field :errors, [String], null: false

    def resolve(email:, password:)
      user = Auth::AuthenticationService.authenticate(email: email, password: password)
      return { user: nil, errors: ["Invalid email or password"] } unless user

      # establish session for GraphQL context
      context[:session][:user_id] = user.id
      { user: user, errors: [] }
    end
  end
end

