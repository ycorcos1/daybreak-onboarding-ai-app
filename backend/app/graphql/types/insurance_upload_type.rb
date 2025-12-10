module Types
  class InsuranceUploadType < Types::BaseObject
    description "Insurance card upload metadata"

    field :id, ID, null: false
    field :referral_id, ID, null: false
    field :front_image_s3_key, String, null: true
    field :back_image_s3_key, String, null: true
    field :ocr_status, String, null: true
    field :ocr_confidence, Float, null: true
    field :created_at, GraphQL::Types::ISO8601DateTime, null: false
    field :updated_at, GraphQL::Types::ISO8601DateTime, null: false
  end
end


