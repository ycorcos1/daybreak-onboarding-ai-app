class ProcessInsuranceOcrJob < ApplicationJob
  queue_as :default

  def perform(insurance_upload_id)
    upload = InsuranceUpload.find(insurance_upload_id)

    result = Ocr::InsuranceCardService.new(insurance_upload: upload).process

    Billing::CostEstimator.new(referral: upload.referral).estimate if result
  rescue StandardError => e
    upload.update(ocr_status: "failed") if upload&.persisted?
    Rails.logger.error("Insurance OCR failed: #{e.message}")
    raise e
  end
end

