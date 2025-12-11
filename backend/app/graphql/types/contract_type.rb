module Types
  class ContractType < Types::BaseObject
    description "Contract for services with an organization"

    field :id, ID, null: false
    field :services, GraphQL::Types::JSON, null: true
    field :terms, String, null: true
    field :contract_url, String, null: true
    field :effective_date, GraphQL::Types::ISO8601Date, null: true
    field :end_date, GraphQL::Types::ISO8601Date, null: true
  end
end


