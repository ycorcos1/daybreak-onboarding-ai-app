module Types
  module Inputs
    class ChildInput < Types::BaseInputObject
      argument :name, String, required: true
      argument :dob, GraphQL::Types::ISO8601Date, required: false
      argument :age_band, String, required: false
      argument :grade, String, required: true
      argument :school_name, String, required: true
      argument :district, String, required: true
      argument :state, String, required: false
      argument :primary_language, String, required: false
      argument :pronouns, String, required: false
    end
  end
end


