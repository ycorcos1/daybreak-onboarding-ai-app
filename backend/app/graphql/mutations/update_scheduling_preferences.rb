module Mutations
  class UpdateSchedulingPreferences < Mutations::BaseMutation
    argument :referral_id, ID, required: true
    argument :scheduling_input, Types::Inputs::SchedulingPreferenceInput, required: true

    field :scheduling_preference, Types::SchedulingPreferenceType, null: true
    field :referral, Types::ReferralType, null: true
    field :errors, [String], null: false

    def resolve(referral_id:, scheduling_input:)
      require_parent!

      referral = current_user.referrals.find_by(id: referral_id)
      return { scheduling_preference: nil, referral: nil, errors: ["Referral not found"] } unless referral
      return { scheduling_preference: nil, referral: nil, errors: ["Referral is not in draft status"] } unless referral.status == "draft"

      windows = normalize_windows(scheduling_input[:windows])
      return { scheduling_preference: nil, referral: nil, errors: ["At least one scheduling window is required"] } if windows.empty?

      invalid_window = windows.any? { |window| !valid_window?(window) }
      return { scheduling_preference: nil, referral: nil, errors: ["Scheduling windows must have a start time before end time"] } if invalid_window

      scheduling_preference = referral.scheduling_preference || referral.build_scheduling_preference
      scheduling_preference.assign_attributes(scheduling_input.to_h.compact.merge(windows: windows))

      SchedulingPreference.transaction do
        scheduling_preference.save!
        Scheduling::SuggestionEngine.new(scheduling_preference: scheduling_preference).generate_suggestions
        referral.update!(last_completed_step: "scheduling", last_updated_step_at: Time.current)
      end

        { scheduling_preference: scheduling_preference, referral: referral, errors: [] }
    rescue ActiveRecord::RecordInvalid => e
      { scheduling_preference: nil, referral: referral, errors: scheduling_preference.errors.full_messages.presence || [e.message] }
    end

    private

    def normalize_windows(raw_windows)
      Array(raw_windows).filter_map do |window|
        day = (window["day"] || window[:day]).to_s.downcase
        start_time = window["start_time"] || window[:start_time]
        end_time = window["end_time"] || window[:end_time]
        next if day.blank? || start_time.blank? || end_time.blank?

        {
          day: day,
          start_time: start_time,
          end_time: end_time
        }
      end
    end

    def valid_window?(window)
      start_time = window[:start_time]
      end_time = window[:end_time]
      start_minutes = minutes_from_string(start_time)
      end_minutes = minutes_from_string(end_time)
      start_minutes && end_minutes && start_minutes < end_minutes
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
end


