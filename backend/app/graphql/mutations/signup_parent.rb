module Mutations
  class SignupParent < Mutations::BaseMutation
    argument :email, String, required: true
    argument :password, String, required: true
    argument :name, String, required: true

    field :user, Types::UserType, null: true
    field :errors, [String], null: false

    def resolve(email:, password:, name:)
      user = Auth::AuthenticationService.signup(
        email: email,
        password: password,
        password_confirmation: password,
        name: name
      )
      # establish session for GraphQL context
      context[:session][:user_id] = user.id
      { user: user, errors: [] }
    rescue ActiveRecord::RecordInvalid => e
      { user: nil, errors: e.record.errors.full_messages }
    end
  end
end

