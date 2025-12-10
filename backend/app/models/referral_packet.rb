class ReferralPacket < ApplicationRecord
  belongs_to :referral

  validates :referral, presence: true
  validates :referral_id, uniqueness: true

  def pdf_url(expires_in: 1.hour)
    return nil unless pdf_s3_key.present?

    Storage::S3Client.new.signed_url(pdf_s3_key, expires_in: expires_in.to_i)
  end

  def packet_complete?
    packet_jsonb.present? && pdf_s3_key.present?
  end
end

