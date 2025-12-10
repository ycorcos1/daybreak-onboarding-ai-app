module Types
  class SchedulingPreferenceType < Types::BaseObject
    description "Scheduling preferences and suggested windows"

    field :id, ID, null: false
    field :referral_id, ID, null: false
    field :timezone, String, null: true
    field :location_preference, String, null: true
    field :windows, GraphQL::Types::JSON, null: false
    field :clinician_preferences, GraphQL::Types::JSON, null: false
    field :suggested_windows, GraphQL::Types::JSON, null: false
    field :preferred_start_date, GraphQL::Types::ISO8601Date, null: true
    field :frequency, String, null: true
    field :created_at, GraphQL::Types::ISO8601DateTime, null: false
    field :updated_at, GraphQL::Types::ISO8601DateTime, null: false
  end
end


