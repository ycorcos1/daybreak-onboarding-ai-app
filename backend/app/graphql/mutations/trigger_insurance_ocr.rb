module Mutations
  class TriggerInsuranceOcr < Mutations::BaseMutation
    argument :referral_id, ID, required: true

    field :insurance_upload, Types::InsuranceUploadType, null: true
    field :errors, [String], null: false

    def resolve(referral_id:)
      require_parent!

      referral = current_user.referrals.find_by(id: referral_id)
      return { insurance_upload: nil, errors: ["Referral not found"] } unless referral

      upload = referral.insurance_uploads.order(created_at: :desc).first
      return { insurance_upload: nil, errors: ["No insurance upload found"] } unless upload

      if upload.front_image_s3_key.blank? && upload.back_image_s3_key.blank?
        return { insurance_upload: nil, errors: ["No card images to process"] }
      end

      upload.update(ocr_status: "processing")
      ProcessInsuranceOcrJob.perform_later(upload.id)

      { insurance_upload: upload, errors: [] }
    end
  end
end

