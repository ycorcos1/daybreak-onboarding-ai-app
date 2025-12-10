require "json"
require "openai"

module Ai
  class ProviderError < StandardError; end

  # OpenAI implementation of the Ai::Client interface.
  class OpenaiProvider < Client
    DEFAULT_MODEL = ENV.fetch("OPENAI_MODEL", "gpt-3.5-turbo")
    DEFAULT_TEMPERATURE = 0.7
    SUPPORT_TEMPERATURE = 0.5
    DEFAULT_MAX_TOKENS = 500
    SUMMARY_MAX_TOKENS = 1500

    def initialize(model: DEFAULT_MODEL, client: nil)
      @model = model
      @client = client || OpenAI::Client.new(access_token: ENV.fetch("OPENAI_API_KEY"))
    end

    def generate_screener_reply(conversation_history:, parent_message:)
      messages = [{ role: "system", content: screener_system_prompt }]
      messages.concat(normalize_history(conversation_history))
      messages << { role: "user", content: parent_message }

      chat_completion(
        messages: messages,
        temperature: DEFAULT_TEMPERATURE,
        max_tokens: DEFAULT_MAX_TOKENS
      )
    end

    def generate_screener_summary(conversation_history:)
      messages = [
        { role: "system", content: screener_summary_prompt },
        { role: "user", content: "Generate a structured JSON summary for this conversation." }
      ]
      messages.concat(normalize_history(conversation_history))

      content = chat_completion(
        messages: messages,
        temperature: SUPPORT_TEMPERATURE,
        max_tokens: SUMMARY_MAX_TOKENS,
        response_format: "json_object"
      )

      safe_json_parse(content)
    end

    def generate_support_reply(conversation_history:, parent_message:)
      messages = [{ role: "system", content: support_system_prompt }]
      messages.concat(normalize_history(conversation_history))
      messages << { role: "user", content: parent_message }

      chat_completion(
        messages: messages,
        temperature: SUPPORT_TEMPERATURE,
        max_tokens: DEFAULT_MAX_TOKENS
      )
    end

    private

    def chat_completion(messages:, temperature:, max_tokens:, response_format: nil)
      params = {
        model: @model,
        messages: messages,
        temperature: temperature,
        max_tokens: max_tokens
      }
      params[:response_format] = { type: response_format } if response_format

      response = @client.chat(parameters: params)
      extract_content(response)
    rescue StandardError => e
      raise ProviderError, "OpenAI call failed: #{e.message}"
    end

    def extract_content(response)
      response.dig("choices", 0, "message", "content") || ""
    end

    def normalize_history(history)
      Array(history).map do |message|
        {
          role: message[:role] || message["role"],
          content: message[:content] || message["content"]
        }
      end.compact
    end

    def safe_json_parse(text)
      return {} if text.nil? || text.strip.empty?

      JSON.parse(text)
    rescue JSON::ParserError
      {}
    end

    def screener_system_prompt
      <<~PROMPT.strip
        You are Daybreak's warm, supportive screener. Maintain a non-judgmental, concise tone (2-3 sentences).
        You do NOT provide diagnoses. You are NOT an emergency service; if user mentions self-harm or harm to others, direct them to emergency services.
        Ask clear follow-up questions about symptoms, duration/frequency, impact at school/home/social life, triggers, and existing supports.
        Reflect back understanding periodically, and keep language plain and supportive.
      PROMPT
    end

    def screener_summary_prompt
      <<~PROMPT.strip
        You are summarizing a parent AI screener conversation.
        Return a JSON object with keys:
        - presenting_concerns (array of strings)
        - symptom_overview (array of strings)
        - context_triggers (array of strings)
        - impact_on_functioning (array of strings)
        - parent_goals (array of strings)
        - communication_preferences (array of strings)
        - risk_flags (array of strings, include emergency guidance shown if applicable)
        Keep content concise and in parent-friendly language. No diagnoses.
      PROMPT
    end

    def support_system_prompt
      <<~PROMPT.strip
        You are Daybreak's supportive assistant for onboarding questions.
        Use a warm, clear tone. Keep answers concise (2-3 sentences).
        Never provide medical diagnoses. Remind users this is not for emergencies; point to 911/ER/crisis lines if crisis language appears.
        Answer common questions about Daybreak, insurance basics, costs (as estimates only), what to expect from therapy, and clarifications about form steps.
        When questions are too specific or sensitive, guide the parent back to the onboarding flow or to human support.
      PROMPT
    end
  end
end

