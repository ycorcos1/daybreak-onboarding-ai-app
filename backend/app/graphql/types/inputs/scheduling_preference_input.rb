module Types
  module Inputs
    class SchedulingPreferenceInput < Types::BaseInputObject
      argument :timezone, String, required: true
      argument :location_preference, String, required: true
      argument :windows, GraphQL::Types::JSON, required: true
      argument :clinician_preferences, GraphQL::Types::JSON, required: false
      argument :preferred_start_date, GraphQL::Types::ISO8601Date, required: false
      argument :frequency, String, required: false
    end
  end
end


