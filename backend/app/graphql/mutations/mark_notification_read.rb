module Mutations
  class MarkNotificationRead < Mutations::BaseMutation
    argument :notification_id, ID, required: true

    field :notification, Types::NotificationType, null: true
    field :errors, [String], null: false

    def resolve(notification_id:)
      require_parent!

      notification = current_user.notifications.find_by(id: notification_id)
      return { notification: nil, errors: ["Notification not found"] } unless notification

      notification.mark_as_read!
      { notification: notification, errors: [] }
    rescue StandardError => e
      Rails.logger.error("Mark notification read failed: #{e.message}")
      { notification: nil, errors: ["Unable to mark notification as read"] }
    end
  end
end


