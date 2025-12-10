class SchedulingPreference < ApplicationRecord
  LOCATION_PREFERENCES = %w[home school either].freeze
  FREQUENCIES = %w[weekly biweekly unsure].freeze

  belongs_to :referral

  validates :referral, presence: true
  validates :referral_id, uniqueness: true
  validates :location_preference, inclusion: { in: LOCATION_PREFERENCES }
  validates :timezone, presence: true
  validates :frequency, inclusion: { in: FREQUENCIES }, allow_nil: true
  validate :require_time_window
  validate :validate_window_ranges

  private

  def require_time_window
    return if windows.is_a?(Array) && windows.any?

    errors.add(:windows, "must include at least one scheduling window")
  end

  def validate_window_ranges
    return unless windows.is_a?(Array)

    invalid = windows.any? do |window|
      start_time = window["start_time"] || window[:start_time]
      end_time = window["end_time"] || window[:end_time]
      day = window["day"] || window[:day]

      day.blank? || !valid_time?(start_time) || !valid_time?(end_time) || !time_order_valid?(start_time, end_time)
    end

    errors.add(:windows, "must have valid day and start/end times") if invalid
  end

  def valid_time?(value)
    return false unless value.is_a?(String)
    !!value.match(/\A\d{2}:\d{2}\z/)
  end

  def time_order_valid?(start_time, end_time)
    start_minutes = minutes_from_string(start_time)
    end_minutes = minutes_from_string(end_time)
    return false unless start_minutes && end_minutes

    start_minutes < end_minutes
  end

  def minutes_from_string(time_str)
    parts = time_str.to_s.split(":")
    return nil unless parts.length == 2

    hours = parts[0].to_i
    minutes = parts[1].to_i
    return nil if hours.negative? || hours > 23 || minutes.negative? || minutes > 59

    hours * 60 + minutes
  end
end

