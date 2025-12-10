require "yaml"
require "active_support/time"

module Scheduling
  class SuggestionEngine
    DEFAULT_CONFIG_PATH = Rails.root.join("config", "availability_profiles.yml").freeze
    MAX_SUGGESTIONS = 3

    def initialize(scheduling_preference:, config_path: DEFAULT_CONFIG_PATH)
      @scheduling_preference = scheduling_preference
      @config_path = config_path
    end

    def generate_suggestions
      return [] if parent_windows.empty? || profiles.empty?

      suggestions = parent_windows.flat_map do |parent_window|
        profiles.flat_map do |profile|
          profile_windows_for_day(profile, parent_window[:day]).filter_map do |profile_window|
            overlap = overlap_window(parent_window, profile_window, profile_timezone(profile))
            next unless overlap

            build_suggestion(overlap, profile["name"])
          end
        end
      end

      ranked = suggestions.sort_by { |s| -s[:confidence_score] }.first(MAX_SUGGESTIONS)
      @scheduling_preference.update!(suggested_windows: ranked)
      ranked
    end

    private

    def parent_timezone
      @parent_timezone ||= ActiveSupport::TimeZone[@scheduling_preference.timezone.presence || "UTC"] || ActiveSupport::TimeZone["UTC"]
    end

    def profiles
      @profiles ||= begin
        config = YAML.safe_load(File.read(@config_path)) || {}
        config["profiles"] || []
      rescue Errno::ENOENT
        []
      end
    end

    def parent_windows
      @parent_windows ||= Array(@scheduling_preference.windows).filter_map do |window|
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

    def profile_windows_for_day(profile, day)
      windows = profile.fetch("windows", {})
      Array(windows[day]) || []
    end

    def profile_timezone(profile)
      tz = profile["timezone"] || @scheduling_preference.timezone
      ActiveSupport::TimeZone[tz] || ActiveSupport::TimeZone["UTC"]
    end

    def overlap_window(parent_window, profile_window, profile_tz)
      parent_start = zoned_time(parent_timezone, parent_window[:day], parent_window[:start_time])
      parent_end = zoned_time(parent_timezone, parent_window[:day], parent_window[:end_time])
      profile_start = zoned_time(profile_tz, parent_window[:day], profile_window["start"])
      profile_end = zoned_time(profile_tz, parent_window[:day], profile_window["end"])

      return nil if parent_start.nil? || parent_end.nil? || profile_start.nil? || profile_end.nil?

      start_utc = [parent_start.utc, profile_start.utc].max
      end_utc = [parent_end.utc, profile_end.utc].min
      return nil unless start_utc < end_utc

      duration_minutes = ((end_utc - start_utc) / 60).floor
      { start_utc: start_utc, end_utc: end_utc, duration_minutes: duration_minutes }
    end

    def zoned_time(zone, day, time_str)
      return nil unless zone && time_str

      date = next_date_for_day(zone, day)
      zone.parse("#{date} #{time_str}")
    end

    def next_date_for_day(zone, day)
      target_wday = day_index(day)
      today = zone.today
      days_ahead = (target_wday - today.wday) % 7
      days_ahead = 7 if days_ahead.zero?
      today + days_ahead
    end

    def day_index(day)
      days = %w[sunday monday tuesday wednesday thursday friday saturday]
      days.index(day.to_s.downcase) || 0
    end

    def build_suggestion(overlap, profile_name)
      {
        start_time: overlap[:start_utc].iso8601,
        end_time: overlap[:end_utc].iso8601,
        confidence_score: calculate_score(overlap),
        source_profile: profile_name
      }
    end

    def calculate_score(overlap)
      base = overlap[:duration_minutes]
      bonus = @scheduling_preference.location_preference == "either" ? 5 : 0
      (base + bonus).to_i
    end
  end
end

