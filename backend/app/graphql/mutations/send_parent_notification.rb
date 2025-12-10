module Mutations
  class SendParentNotification < Mutations::BaseMutation
    argument :user_id, ID, required: true
    argument :referral_id, ID, required: false
    argument :notification_type, String, required: true
    argument :payload, GraphQL::Types::JSON, required: false, default_value: {}

    field :notification, Types::NotificationType, null: true
    field :errors, [String], null: false

    def resolve(user_id:, referral_id: nil, notification_type:, payload: {})
      require_admin!

      user = User.find_by(id: user_id)
      return { notification: nil, errors: ["User not found"] } unless user

      notification = user.notifications.build(
        referral_id: referral_id,
        notification_type: notification_type,
        payload_jsonb: payload
      )

      if notification.save
        { notification: notification, errors: [] }
      else
        { notification: nil, errors: notification.errors.full_messages }
      end
    end
  end
end


