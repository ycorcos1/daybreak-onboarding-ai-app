module Ai
  # Abstract interface for AI providers used by screener and support chat flows.
  # Concrete implementations must implement all public methods below.
  class Client
    class NotImplementedError < StandardError; end

    def generate_screener_reply(conversation_history:, parent_message:)
      raise NotImplementedError, "generate_screener_reply must be implemented by a provider"
    end

    def generate_screener_summary(conversation_history:)
      raise NotImplementedError, "generate_screener_summary must be implemented by a provider"
    end

    def generate_support_reply(conversation_history:, parent_message:)
      raise NotImplementedError, "generate_support_reply must be implemented by a provider"
    end
  end
end

