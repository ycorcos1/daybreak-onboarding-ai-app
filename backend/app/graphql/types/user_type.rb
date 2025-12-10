module Types
  class UserType < Types::BaseObject
    description "User account"

    field :id, ID, null: false
    field :email, String, null: false
    field :name, String, null: false
    field :role, Types::RoleEnum, null: false
    field :phone, String, null: true
    field :address, String, null: true
    field :language_preference, String, null: true
    field :relationship_to_child, String, null: true
    field :created_at, GraphQL::Types::ISO8601DateTime, null: false
    field :updated_at, GraphQL::Types::ISO8601DateTime, null: false

    field :children, [Types::ChildType], null: false
    field :referrals, [Types::ReferralType], null: false
    field :notifications, [Types::NotificationType], null: false
  end
end


