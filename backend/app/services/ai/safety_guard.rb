module Ai
  # Lightweight safety layer to detect crisis language in messages.
  class SafetyGuard
    CRISIS_KEYWORDS = [
      /suicide/i,
      /kill myself/i,
      /end my life/i,
      /self[-\s]?harm/i,
      /hurt myself/i,
      /harm others/i,
      /kill (them|him|her|someone)/i,
      /violence/i,
      /abuse/i,
      /weapon/i
    ].freeze

    HIGH_RISK_KEYWORDS = [
      /severe depression/i,
      /can't go on/i,
      /overdose/i,
      /panic attacks?/i,
      /unsafe/i
    ].freeze

    def self.evaluate(text)
      return { risk_level: :ok, reasons: [] } if text.to_s.strip.empty?

      crisis_reasons = matchers_for(text, CRISIS_KEYWORDS)
      return { risk_level: :crisis, reasons: crisis_reasons } if crisis_reasons.any?

      high_risk_reasons = matchers_for(text, HIGH_RISK_KEYWORDS)
      return { risk_level: :high_risk, reasons: high_risk_reasons } if high_risk_reasons.any?

      { risk_level: :ok, reasons: [] }
    end

    def self.emergency_message
      "If you or your child are in crisis or considering self-harm, please call 911 or go to the nearest emergency room. You can also call or text 988 to reach the Suicide & Crisis Lifeline."
    end

    def self.matchers_for(text, patterns)
      patterns.filter_map do |pattern|
        pattern.source if text.match?(pattern)
      end
    end
    private_class_method :matchers_for
  end
end

