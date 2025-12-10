# Configure production logging to be structured and PHI-safe.
if Rails.env.production?
  class PhiSafeLogger < ActiveSupport::Logger
    PHI_PATTERNS = [
      /\b[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}\b/i, # emails
      /\b\d{3}[-.]?\d{3}[-.]?\d{4}\b/,              # phone numbers
      /\b\d{3}-\d{2}-\d{4}\b/,                      # SSNs
      /\b\d{9}\b/,                                  # generic 9-digit IDs (best-effort)
    ].freeze

    def add(severity, message = nil, progname = nil, &block)
      if message
        PHI_PATTERNS.each do |pattern|
          message = message.gsub(pattern, "[REDACTED]")
        end
      end
      super(severity, message, progname, &block)
    end
  end

  logger = PhiSafeLogger.new($stdout)
  logger.formatter = Logger::Formatter.new
  Rails.logger = ActiveSupport::TaggedLogging.new(logger)
  ActiveRecord::Base.logger = Rails.logger if defined?(ActiveRecord)
end

