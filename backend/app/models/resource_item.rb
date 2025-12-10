class ResourceItem < ApplicationRecord
  RESOURCE_TYPES = %w[article video interactive].freeze

  belongs_to :created_by_admin, class_name: "User", optional: true

  validates :title, presence: true
  validates :resource_type, presence: true, inclusion: { in: RESOURCE_TYPES }
  validate :body_or_url_present

  scope :published, -> { where(published: true) }
  scope :by_tag, ->(tag) { where("? = ANY(tags)", tag) }

  private

  def body_or_url_present
    return if resource_type.blank?

    case resource_type
    when "article"
      errors.add(:body, "must be present for articles") if body.blank?
    when "video", "interactive"
      errors.add(:url, "must be present for video or interactive types") if url.blank?
    end
  end
end

