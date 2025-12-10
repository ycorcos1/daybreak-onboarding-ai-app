module Types
  class ReferralNoteType < Types::BaseObject
    description "Admin note on referral"

    field :id, ID, null: false
    field :referral_id, ID, null: false
    field :admin_user_id, ID, null: false
    field :note_text, String, null: false
    field :created_at, GraphQL::Types::ISO8601DateTime, null: false
    field :updated_at, GraphQL::Types::ISO8601DateTime, null: false

    field :admin_user, Types::UserType, null: false
  end
end


