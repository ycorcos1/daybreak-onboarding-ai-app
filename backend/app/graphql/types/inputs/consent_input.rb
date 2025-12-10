module Types
  module Inputs
    class ConsentInput < Types::BaseInputObject
      argument :consent_type, Types::ConsentTypeEnum, required: true
      argument :accepted_at, GraphQL::Types::ISO8601DateTime, required: true
      argument :ip_address, String, required: false
      argument :user_agent, String, required: false
    end
  end
end


