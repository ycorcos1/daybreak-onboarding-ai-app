module Types
  module Inputs
    class ReferralFilterInput < Types::BaseInputObject
      argument :status, [Types::ReferralStatusEnum], required: false
      argument :risk_flag, Boolean, required: false
      argument :school_name, String, required: false
      argument :district, String, required: false
      argument :created_from, GraphQL::Types::ISO8601DateTime, required: false
      argument :created_to, GraphQL::Types::ISO8601DateTime, required: false
      argument :submitted_from, GraphQL::Types::ISO8601DateTime, required: false
      argument :submitted_to, GraphQL::Types::ISO8601DateTime, required: false
    end
  end
end


