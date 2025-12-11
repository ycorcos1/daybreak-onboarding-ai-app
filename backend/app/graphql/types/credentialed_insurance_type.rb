module Types
  class CredentialedInsuranceType < Types::BaseObject
    description "Insurance payor credentialed with clinicians"

    field :id, ID, null: false
    field :name, String, null: false
    field :state, String, null: true
    field :line_of_business, String, null: true
    field :network_status, String, null: true
  end
end


