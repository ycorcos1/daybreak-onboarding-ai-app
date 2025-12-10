module Notifications
  # Centralized in-app notification dispatcher.
  # All notification creation should flow through here to keep copy and types consistent
  # and to avoid duplicated logic across mutations/services.
  class Dispatcher
    class << self
      def referral_created(referral:, user:)
        child_name = referral.child&.name.presence || "your child"

        notify(
          user: user,
          referral: referral,
          type: "referral.created",
          title: "Referral started",
          message: "You've started a referral for #{child_name}. Continue the steps to submit."
        )
      end

      def referral_submitted(referral:, user:)
        child_name = referral.child&.name.presence || "your child"

        notify(
          user: user,
          referral: referral,
          type: "referral.submitted",
          title: "Referral submitted",
          message: "We've received your referral for #{child_name} and will begin review shortly."
        )
      end

      def referral_status_changed(referral:, user:, new_status:)
        template = Referrals::StatusTransitionService::STATUS_MESSAGES[new_status]
        title = template&.dig(:title) || "Referral update"
        message = template&.dig(:message) || "Your referral status changed to #{new_status}."

        notify(
          user: user,
          referral: referral,
          type: "referral.status_changed",
          title: title,
          message: message,
          extra: { status: new_status }
        )
      end

      def admin_message_sent(referral:, user:, message_preview:)
        child_name = referral.child&.name.presence || "your child"

        notify(
          user: user,
          referral: referral,
          type: "admin.message_sent",
          title: "Message from Daybreak team",
          message: "You have a new message about #{child_name}.",
          extra: { preview: message_preview.to_s }
        )
      end

      def deletion_requested(referral:, admin_user: nil)
        # Notify parent that request was received
        notify(
          user: referral.user,
          referral: referral,
          type: "referral.deletion_requested",
          title: "Deletion request received",
          message: "We received your request to delete this referral. An admin will review and confirm."
        )

        # Notify admins that action is required
        scope = admin_user ? [admin_user] : User.where(role: "admin")
        scope.find_each do |admin|
          notify(
            user: admin,
            referral: referral,
            type: "referral.deletion_requested",
            title: "Deletion request pending",
            message: "A parent requested deletion for referral ##{referral.id}."
          )
        end
      end

      def deletion_approved(referral:, user:)
        notify(
          user: user,
          referral: referral,
          type: "referral.deleted",
          title: "Referral data deleted",
          message: "Your referral data has been deleted per your request."
        )
      end

      private

      def notify(user:, referral:, type:, title:, message:, extra: {})
        Notification.create!(
          user: user,
          referral: referral,
          notification_type: type,
          payload_jsonb: {
            title: title,
            message: message
          }.merge(extra)
        )
      rescue StandardError => e
        Rails.logger.error("Notification dispatch failed (type=#{type}): #{e.message}")
        nil
      end
    end
  end
end


