module Types
  class ReferralPacketType < Types::BaseObject
    description "Generated referral packet outputs"

    field :id, ID, null: false
    field :referral_id, ID, null: false
    field :packet_jsonb, GraphQL::Types::JSON, null: true
    field :pdf_s3_key, String, null: true
    field :pdf_url, String, null: true, description: "Signed URL for PDF (admin only)"
    field :created_at, GraphQL::Types::ISO8601DateTime, null: false
    field :updated_at, GraphQL::Types::ISO8601DateTime, null: false

    def pdf_url
      return nil unless context[:current_user]&.admin?

      object.pdf_url
    end
  end
end


