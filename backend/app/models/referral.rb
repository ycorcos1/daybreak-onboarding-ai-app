class Referral < ApplicationRecord
  ACTIVE_STATUSES = %w[draft submitted in_review].freeze
  STATUSES = (ACTIVE_STATUSES + %w[ready_to_schedule scheduled closed withdrawn deleted]).freeze
  SESSION_TYPES = %w[in_person telehealth].freeze
  PACKET_STATUSES = %w[not_generated generating complete failed].freeze
  ONBOARDING_STEPS = %w[parent-info child-info screener intake insurance cost scheduling consent review].freeze

  belongs_to :child
  has_one :user, through: :child

  has_one :intake_response, dependent: :destroy
  has_one :ai_screener_session, dependent: :destroy
  has_one :insurance_detail, dependent: :destroy
  has_many :insurance_uploads, dependent: :destroy
  has_one :cost_estimate, dependent: :destroy
  has_one :scheduling_preference, dependent: :destroy
  has_many :consent_records, dependent: :destroy
  has_one :referral_packet, dependent: :destroy
  has_many :support_chats, dependent: :destroy
  has_many :referral_notes, dependent: :destroy
  has_many :notifications, dependent: :destroy

  validates :child, presence: true
  validates :status, presence: true, inclusion: { in: STATUSES }
  validates :session_type, inclusion: { in: SESSION_TYPES }, allow_nil: true
  validates :packet_status, inclusion: { in: PACKET_STATUSES }, allow_nil: true
  validates :last_completed_step, inclusion: { in: ONBOARDING_STEPS }, allow_nil: true

  validate :single_active_referral_per_child

  scope :active, -> { where(status: ACTIVE_STATUSES) }
  scope :submitted, -> { where.not(submitted_at: nil) }
  scope :high_risk, -> { where(risk_flag: true) }

  def active?
    ACTIVE_STATUSES.include?(status)
  end

  def submitted?
    submitted_at.present?
  end

  def ready_for_submission?
    errors.clear
    validate_parent_info
    validate_child_info
    validate_insurance_status
    validate_scheduling_windows
    validate_consents_presence
    validate_primary_concern_presence
    errors.empty?
  end

  def generate_packet!
    update!(packet_status: "generating")
    ReferralPacketGenerationJob.perform_later(id)
  end

  def packet_pdf_signed_url(expires_in: 1.hour)
    return nil unless referral_packet&.pdf_s3_key.present?

    s3_client.generate_presigned_url(referral_packet.pdf_s3_key, expires_in: expires_in.to_i)
  end

  def next_step
    return ONBOARDING_STEPS.first if last_completed_step.blank?

    current_index = ONBOARDING_STEPS.index(last_completed_step)
    return ONBOARDING_STEPS.first unless current_index

    ONBOARDING_STEPS[[current_index + 1, ONBOARDING_STEPS.length - 1].min]
  end

  def upsert_referral_packet!(attributes)
    if referral_packet.present?
      referral_packet.update!(attributes)
    else
      create_referral_packet!(attributes)
    end
  end

  private

  def validate_parent_info
    errors.add(:base, "Parent information incomplete") unless user&.name.present? && user&.email.present? && user&.phone.present?
  end

  def validate_child_info
    required_child_fields_present = child&.name.present? &&
                                    (child&.dob.present? || child&.age_band.present?) &&
                                    child&.grade.present? &&
                                    child&.school_name.present? &&
                                    child&.district.present?
    errors.add(:base, "Child information incomplete") unless required_child_fields_present
  end

  def validate_insurance_status
    errors.add(:base, "Insurance status is required") unless insurance_detail&.insurance_status.present?
  end

  def validate_scheduling_windows
    pref = scheduling_preference
    errors.add(:base, "Scheduling preferences are required") unless pref
    return unless pref

    if pref.timezone.blank?
      errors.add(:base, "Timezone is required for scheduling")
    end

    if pref.location_preference.blank?
      errors.add(:base, "Location preference is required")
    end

    windows = pref.windows
    unless windows.present? && windows.any?
      errors.add(:base, "At least one scheduling window is required")
      return
    end

    invalid_window = windows.any? { |window| !valid_window?(window) }
    errors.add(:base, "Scheduling windows must include a start time before end time") if invalid_window
  end

  def validate_consents_presence
    required_types = %w[
      terms_of_use
      privacy_policy
      non_emergency_acknowledgment
      telehealth_consent
      guardian_authorization
    ]
    existing_types = consent_records.pluck(:consent_type)
    missing = required_types - existing_types
    errors.add(:base, "Required consents are missing: #{missing.join(', ')}") if missing.any?
  end

  def validate_primary_concern_presence
    clinical_concern = intake_response&.responses.present? &&
                       (intake_response.responses["primary_concerns"].present? || intake_response.responses["primary_concern"].present?)
    screener_concern = ai_screener_session&.transcript_jsonb.present? || ai_screener_session&.summary_jsonb.present?
    errors.add(:base, "A primary concern or description is required") unless clinical_concern || screener_concern
  end

  def valid_window?(window)
    start_time = window["start_time"] || window[:start_time]
    end_time = window["end_time"] || window[:end_time]
    return false if start_time.blank? || end_time.blank?

    start_minutes = parse_minutes(start_time)
    end_minutes = parse_minutes(end_time)
    return false unless start_minutes && end_minutes

    start_minutes < end_minutes
  end

  def parse_minutes(time_str)
    match = time_str.to_s.match(/\A(\d{1,2}):(\d{2})\z/)
    return nil unless match

    hours = match[1].to_i
    minutes = match[2].to_i
    return nil if hours.negative? || hours > 23 || minutes.negative? || minutes > 59

    hours * 60 + minutes
  end

  def s3_client
    @s3_client ||= Storage::S3Client.new
  end

  def single_active_referral_per_child
    return unless child_id.present?
    return unless ACTIVE_STATUSES.include?(status)

    if self.class.where(child_id: child_id, status: ACTIVE_STATUSES).where.not(id: id).exists?
      errors.add(:base, "Only one active referral per child allowed")
    end
  end
end

