class Notification < ApplicationRecord
  belongs_to :user
  belongs_to :referral, optional: true

  validates :user, presence: true
  validates :notification_type, presence: true

  scope :unread, -> { where(read_at: nil) }
  scope :read, -> { where.not(read_at: nil) }

  def mark_as_read!
    update!(read_at: Time.current)
  end

  def read?
    read_at.present?
  end
end

