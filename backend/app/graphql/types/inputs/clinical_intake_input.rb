module Types
  module Inputs
    class ClinicalIntakeInput < Types::BaseInputObject
      argument :responses, GraphQL::Types::JSON, required: true
    end
  end
end


