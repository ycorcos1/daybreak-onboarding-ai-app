module Types
  class ClinicianAvailabilityType < Types::BaseObject
    description "Availability window for a clinician"

    field :id, ID, null: false
    field :clinician_id, ID, null: false
    field :day_of_week, Integer, null: true
    field :start_time, String, null: true
    field :end_time, String, null: true
    field :timezone, String, null: true
    field :created_at, GraphQL::Types::ISO8601DateTime, null: true
    field :updated_at, GraphQL::Types::ISO8601DateTime, null: true
  end
end


