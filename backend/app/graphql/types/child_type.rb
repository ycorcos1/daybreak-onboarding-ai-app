module Types
  class ChildType < Types::BaseObject
    description "Child information"

    field :id, ID, null: false
    field :user_id, ID, null: false
    field :name, String, null: false
    field :dob, GraphQL::Types::ISO8601Date, null: true
    field :age_band, String, null: true
    field :grade, String, null: false
    field :school_name, String, null: false
    field :district, String, null: false
    field :state, String, null: true
    field :primary_language, String, null: true
    field :pronouns, String, null: true
    field :created_at, GraphQL::Types::ISO8601DateTime, null: false
    field :updated_at, GraphQL::Types::ISO8601DateTime, null: false

    field :user, Types::UserType, null: false
    field :referrals, [Types::ReferralType], null: false
  end
end


