class User < ApplicationRecord
  has_secure_password

  ROLES = %w[parent admin].freeze

  has_many :children, dependent: :destroy
  has_many :referrals, through: :children
  has_many :notifications, dependent: :destroy
  has_many :support_chats, foreign_key: :parent_user_id, dependent: :destroy
  has_many :referral_notes, foreign_key: :admin_user_id, dependent: :nullify

  validates :email, presence: true, uniqueness: true,
                    format: { with: URI::MailTo::EMAIL_REGEXP }
  validates :password, length: { minimum: 8 }, if: -> { password_digest_changed? }
  validates :role, presence: true, inclusion: { in: ROLES }
  validates :name, presence: true

  scope :parents, -> { where(role: "parent") }
  scope :admins, -> { where(role: "admin") }

  def parent?
    role == "parent"
  end

  def admin?
    role == "admin"
  end
end

