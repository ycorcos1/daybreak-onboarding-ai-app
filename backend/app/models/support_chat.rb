class SupportChat < ApplicationRecord
  MODES = %w[ai human mixed].freeze

  belongs_to :referral, optional: true
  belongs_to :parent_user, class_name: "User"

  has_many :support_chat_messages, foreign_key: :chat_id, dependent: :destroy

  validates :parent_user, presence: true
  validates :mode, inclusion: { in: MODES }, allow_nil: true
end

