module Mutations
  class StartInsuranceUpload < Mutations::BaseMutation
    argument :referral_id, ID, required: true
    argument :front_image_s3_key, String, required: false
    argument :back_image_s3_key, String, required: false

    field :insurance_upload, Types::InsuranceUploadType, null: true
    field :errors, [String], null: false

    def resolve(referral_id:, front_image_s3_key: nil, back_image_s3_key: nil)
      require_parent!

      referral = current_user.referrals.find_by(id: referral_id)
      return { insurance_upload: nil, errors: ["Referral not found"] } unless referral

      upload = referral.insurance_uploads.order(created_at: :desc).first || referral.insurance_uploads.build

      upload.assign_attributes(
        front_image_s3_key: front_image_s3_key.presence || upload.front_image_s3_key,
        back_image_s3_key: back_image_s3_key.presence || upload.back_image_s3_key,
        ocr_status: "pending"
      )

      if upload.save
        { insurance_upload: upload, errors: [] }
      else
        { insurance_upload: nil, errors: upload.errors.full_messages }
      end
    end
  end
end

