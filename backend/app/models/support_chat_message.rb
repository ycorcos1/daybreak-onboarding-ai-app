class SupportChatMessage < ApplicationRecord
  SENDER_TYPES = %w[parent admin ai].freeze

  belongs_to :support_chat, foreign_key: :chat_id

  validates :support_chat, presence: true
  validates :sender_type, presence: true, inclusion: { in: SENDER_TYPES }
  validates :message_text, presence: true
end

