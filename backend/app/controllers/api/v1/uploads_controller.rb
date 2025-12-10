require "securerandom"

class Api::V1::UploadsController < ApplicationController
  include Authenticatable
  include Authorizable

  skip_before_action :verify_authenticity_token
  before_action :authenticate_user!

  # POST /api/v1/uploads/insurance/presign
  def presign_insurance_upload
    referral = current_user.referrals.find_by(id: params[:referral_id])
    return render json: { error: "Referral not found" }, status: :not_found unless referral

    file_type = params[:file_type].to_s
    unless %w[front back].include?(file_type)
      return render json: { error: "file_type must be 'front' or 'back'" }, status: :unprocessable_entity
    end

    content_type = params[:content_type].presence || "image/jpeg"
    key = "insurance_uploads/#{referral.id}/#{file_type}-#{SecureRandom.uuid}"

    presigned_post = s3_client.generate_presigned_post(key, content_type: content_type)

    render json: {
      url: presigned_post.url,
      fields: presigned_post.fields,
      key: key
    }
  rescue Storage::S3Client::Error => e
    render json: { error: e.message }, status: :internal_server_error
  end

  private

  def s3_client
    @s3_client ||= Storage::S3Client.new
  end
end

