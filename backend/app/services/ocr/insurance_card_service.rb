require "aws-sdk-textract"

module Ocr
  class InsuranceCardService
    DEFAULT_CONFIDENCE_THRESHOLD = (ENV["OCR_CONFIDENCE_THRESHOLD"] || 0.7).to_f

    def initialize(insurance_upload:, bucket: ENV.fetch("AWS_S3_BUCKET"))
      @insurance_upload = insurance_upload
      @bucket = bucket
      @textract = Aws::Textract::Client.new(region: ENV["AWS_REGION"])
    end

    def process
      validate_upload_keys!
      @insurance_upload.update!(ocr_status: "processing")

      front_result = extract_text(@insurance_upload.front_image_s3_key)
      back_result = extract_text(@insurance_upload.back_image_s3_key)

      combined_lines = front_result[:lines] + back_result[:lines]
      confidence_scores = front_result[:confidences] + back_result[:confidences]
      avg_confidence = average_confidence(confidence_scores)

      fields = extract_fields(combined_lines)
      update_insurance_detail(fields, avg_confidence)

      @insurance_upload.update!(
        ocr_status: "complete",
        ocr_confidence: avg_confidence
      )

      { fields: fields, confidence: avg_confidence, status: :complete }
    rescue StandardError => e
      @insurance_upload.update!(ocr_status: "failed") rescue nil
      raise e
    end

    private

    def validate_upload_keys!
      return if @insurance_upload.front_image_s3_key.present? || @insurance_upload.back_image_s3_key.present?

      raise ArgumentError, "Insurance upload missing image keys"
    end

    def extract_text(s3_key)
      return { lines: [], confidences: [] } if s3_key.blank?

      response = @textract.detect_document_text(
        document: {
          s3_object: {
            bucket: @bucket,
            name: s3_key
          }
        }
      )

      lines = response.blocks.select { |block| block.block_type == "LINE" }.map(&:text).compact
      confidences = response.blocks.filter_map(&:confidence)

      { lines: lines, confidences: confidences }
    end

    def extract_fields(lines)
      text_blob = lines.join("\n")

      {
        insurer_name: find_first(lines, /insur|insurance/i) || first_non_empty(lines),
        plan_name: find_first(lines, /plan/i),
        member_id: capture_value(text_blob, /(member\s*id[:\s]*)([A-Za-z0-9\-]+)/i),
        group_id: capture_value(text_blob, /(group\s*(id|#)[:\s]*)([A-Za-z0-9\-]+)/i, group_index: 3),
        policyholder_name: find_first(lines, /subscriber|policyholder/i),
        coverage_phone: capture_value(text_blob, /(\+?1?[\s\-\(]*\d{3}[\)\s\-]*\d{3}[\s\-]*\d{4})/),
        coverage_website: capture_value(text_blob, /(https?:\/\/[^\s]+)/i)
      }.compact
    end

    def update_insurance_detail(fields, avg_confidence)
      detail = @insurance_upload.referral.insurance_detail
      raise StandardError, "Insurance detail record not found" unless detail

      new_source = detail.source == "manual" ? "both" : "ocr"

      detail.assign_attributes(fields.merge(source: new_source))
      detail.save!

      # Confidence can be used downstream to prompt manual review
      detail
    end

    def average_confidence(confidences)
      return nil if confidences.empty?

      (confidences.sum / confidences.size.to_f).round(2)
    end

    def find_first(lines, pattern)
      lines.find { |line| line.match?(pattern) }
    end

    def first_non_empty(lines)
      lines.find { |line| line.to_s.strip.length.positive? }
    end

    def capture_value(text, regex, group_index: 2)
      match = text.match(regex)
      match && match[group_index]
    end
  end
end

