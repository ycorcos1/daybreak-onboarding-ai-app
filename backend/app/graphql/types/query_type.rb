module Types
  class QueryType < Types::BaseObject
    description "The query root for the Daybreak GraphQL API"

    # ---- Parent-facing queries ----
    field :me, Types::UserType, null: true, description: "Current authenticated user"
    def me
      current_user
    end

    field :my_referrals, [Types::ReferralType], null: false, description: "Referrals for the current parent"
    def my_referrals
      require_parent!
      current_user.referrals.includes(:child, :intake_response, :ai_screener_session,
                                      :insurance_detail, :cost_estimate, :scheduling_preference,
                                      :consent_records, :referral_packet, :support_chats, :notifications)
                  .order(created_at: :desc)
    end

    field :referral, Types::ReferralType, null: true, description: "Fetch a referral by ID with RBAC" do
      argument :id, ID, required: true
    end
    def referral(id:)
      require_authentication!
      referral = Referral.includes(:child, :user).find_by(id: id)
      return nil unless referral

      if current_user.parent?
        ensure_ownership!(referral)
      end

      referral
    end

    field :my_notifications, [Types::NotificationType], null: false, description: "Notifications for the current parent" do
      argument :unread_only, Boolean, required: false, default_value: false
    end
    def my_notifications(unread_only:)
      require_parent!
      scope = current_user.notifications.order(created_at: :desc)
      scope = scope.where(read_at: nil) if unread_only
      scope
    end

    field :screener_session, Types::AiScreenerSessionType, null: true, description: "AI screener session for a referral" do
      argument :referral_id, ID, required: true
    end
    def screener_session(referral_id:)
      require_parent!
      referral = current_user.referrals.find_by(id: referral_id)
      return nil unless referral

      referral.ai_screener_session
    end

    field :resources, [Types::ResourceItemType], null: false, description: "Published resources for parents" do
      argument :tags, [String], required: false
    end
    def resources(tags: nil)
      scope = ResourceItem.where(published: true)
      scope = scope.where("tags && ARRAY[?]::varchar[]", tags) if tags.present?
      scope.order(created_at: :desc)
    end

    field :my_support_chats, [Types::SupportChatType], null: false, description: "Support chats for the current parent" do
      argument :referral_id, ID, required: false
    end
    def my_support_chats(referral_id: nil)
      require_parent!
      chats = current_user.support_chats.includes(:support_chat_messages).order(updated_at: :desc)
      referral_id.present? ? chats.where(referral_id: referral_id) : chats
    end

    field :my_support_chat, Types::SupportChatType, null: true, description: "Single support chat for parent" do
      argument :id, ID, required: true
    end
    def my_support_chat(id:)
      require_parent!
      current_user.support_chats.includes(:support_chat_messages).find_by(id: id)
    end

    # ---- Admin-facing queries ----
    field :admin_referrals, [Types::ReferralType], null: false, description: "Admin referral list with filters" do
      argument :filter, Types::Inputs::ReferralFilterInput, required: false
      argument :limit, Integer, required: false, default_value: 50
      argument :offset, Integer, required: false, default_value: 0
    end
    def admin_referrals(filter: nil, limit: 50, offset: 0)
      require_admin!
      referrals = Referral.includes(:child, :user).order(created_at: :desc)

      if filter.present?
        referrals = referrals.where(status: filter[:status]) if filter[:status].present?
        referrals = referrals.where(risk_flag: filter[:risk_flag]) unless filter[:risk_flag].nil?
        referrals = referrals.joins(:child).where(children: { school_name: filter[:school_name] }) if filter[:school_name].present?
        referrals = referrals.joins(:child).where(children: { district: filter[:district] }) if filter[:district].present?
        referrals = referrals.where("referrals.created_at >= ?", filter[:created_from]) if filter[:created_from].present?
        referrals = referrals.where("referrals.created_at <= ?", filter[:created_to]) if filter[:created_to].present?
        referrals = referrals.where("referrals.submitted_at >= ?", filter[:submitted_from]) if filter[:submitted_from].present?
        referrals = referrals.where("referrals.submitted_at <= ?", filter[:submitted_to]) if filter[:submitted_to].present?
      end

      referrals.limit(limit).offset(offset)
    end

    field :admin_referral, Types::ReferralType, null: true, description: "Admin detail for a single referral" do
      argument :id, ID, required: true
    end
    def admin_referral(id:)
      require_admin!
      Referral.includes(:child, :user, :intake_response, :ai_screener_session, :insurance_detail,
                        :insurance_uploads, :cost_estimate, :scheduling_preference, :consent_records,
                        :referral_packet, :support_chats, :referral_notes, :notifications)
              .find_by(id: id)
    end

    field :admin_resources, [Types::ResourceItemType], null: false, description: "Admin resource list"
    def admin_resources
      require_admin!
      ResourceItem.order(created_at: :desc)
    end

    field :admin_resource, Types::ResourceItemType, null: true, description: "Single admin resource" do
      argument :id, ID, required: true
    end
    def admin_resource(id:)
      require_admin!
      ResourceItem.find_by(id: id)
    end

    field :admin_chats, [Types::SupportChatType], null: false, description: "All support chats" do
      argument :limit, Integer, required: false, default_value: 50
      argument :offset, Integer, required: false, default_value: 0
    end
    def admin_chats(limit: 50, offset: 0)
      require_admin!
      SupportChat.includes(:parent_user, :referral, :support_chat_messages)
                 .order(updated_at: :desc)
                 .limit(limit)
                 .offset(offset)
    end

    field :admin_chat, Types::SupportChatType, null: true, description: "Single support chat thread (admin)" do
      argument :id, ID, required: true
    end
    def admin_chat(id:)
      require_admin!
      SupportChat.includes(:parent_user, :referral, :support_chat_messages).find_by(id: id)
    end

    field :admin_notifications, [Types::NotificationType], null: false, description: "All notifications (admin)" do
      argument :limit, Integer, required: false, default_value: 100
    end
    def admin_notifications(limit:)
      require_admin!
      Notification.includes(:user, :referral).order(created_at: :desc).limit(limit)
    end
  end
end


