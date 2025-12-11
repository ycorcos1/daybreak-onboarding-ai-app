module Types
  class InsuranceCoverageType < Types::BaseObject
    description "Represents an insurance coverage record"

    field :id, ID, null: false
    field :user_id, ID, null: false
    field :credentialed_insurance_id, ID, null: true
    field :insurance_company_name, String, null: true
    field :policy_holder_name, String, null: true
    field :plan_name, String, null: true
    field :member_id, String, null: true
    field :group_number, String, null: true
    field :eligibility_verified, Boolean, null: true
    field :in_network, Boolean, null: true
    field :out_of_network, Boolean, null: true
    field :created_at, GraphQL::Types::ISO8601DateTime, null: false
    field :updated_at, GraphQL::Types::ISO8601DateTime, null: false

    field :user, Types::UserType, null: false
    field :credentialed_insurance, Types::CredentialedInsuranceType, null: true
  end
end

