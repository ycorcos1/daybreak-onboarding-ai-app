require "yaml"

module Billing
  class CostEstimator
    DEFAULT_CONFIG_PATH = Rails.root.join("config", "cost_rules.yml").freeze
    DISCLAIMER = "This estimate is not a guarantee of coverage. Final determination will be made by Daybreak and your insurance provider.".freeze

    def initialize(referral:, config_path: DEFAULT_CONFIG_PATH)
      @referral = referral
      @config_path = config_path
    end

    def estimate
      rule = matching_rule || default_rule
      category = (rule["category"] || "tbd")
      explanation = rule["explanation"].to_s.strip
      rule_key = rule["name"] || "default"

      cost_estimate = @referral.cost_estimate || @referral.build_cost_estimate
      cost_estimate.update!(
        category: category,
        rule_key: rule_key,
        explanation_text: explanation_with_disclaimer(explanation)
      )

      { category: category, explanation: explanation_with_disclaimer(explanation), rule_key: rule_key }
    end

    private

    def rules
      @rules ||= begin
        config = YAML.safe_load(File.read(@config_path)) || {}
        config["rules"] || []
      rescue Errno::ENOENT
        []
      end
    end

    def partner_districts
      @partner_districts ||= begin
        config = YAML.safe_load(File.read(@config_path)) || {}
        config["partner_districts"] || []
      rescue Errno::ENOENT
        []
      end
    end

    def matching_rule
      rules.find { |rule| rule_matches?(rule) }
    end

    def rule_matches?(rule)
      conditions = rule["conditions"] || {}

      conditions.all? do |key, value|
        case key
        when "insurance_status"
          insurance_status == value
        when "partner_district"
          partner_district? == value
        when "district_in"
          value.is_a?(Array) && value.map(&:downcase).include?(child_district.to_s.downcase)
        else
          false
        end
      end
    end

    def default_rule
      {
        "name" => "default_fallback",
        "category" => "tbd",
        "explanation" => "We will review your information and confirm any costs before your first session."
      }
    end

    def insurance_status
      @referral.insurance_detail&.insurance_status || "unknown"
    end

    def partner_district?
      partner_districts.map(&:downcase).include?(child_district.to_s.downcase)
    end

    def child_district
      @referral.child&.district
    end

    def explanation_with_disclaimer(explanation)
      [explanation, DISCLAIMER].reject(&:blank?).join(" ")
    end
  end
end

