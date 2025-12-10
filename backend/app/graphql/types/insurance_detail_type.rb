module Types
  class InsuranceDetailType < Types::BaseObject
    description "Insurance detail captured for referral"

    field :id, ID, null: false
    field :referral_id, ID, null: false
    field :insurance_status, String, null: false
    field :insurer_name, String, null: true
    field :plan_name, String, null: true
    field :member_id, String, null: true
    field :group_id, String, null: true
    field :policyholder_name, String, null: true
    field :coverage_phone, String, null: true
    field :coverage_website, String, null: true
    field :source, String, null: true
    field :created_at, GraphQL::Types::ISO8601DateTime, null: false
    field :updated_at, GraphQL::Types::ISO8601DateTime, null: false
  end
end


