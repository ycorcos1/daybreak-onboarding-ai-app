module Types
  class MutationType < Types::BaseObject
    description "The mutation root for the Daybreak GraphQL API"

    # Parent-facing mutations
    field :create_child_and_referral, mutation: Mutations::CreateChildAndReferral
    field :update_parent_info, mutation: Mutations::UpdateParentInfo
    field :update_child_info, mutation: Mutations::UpdateChildInfo
    field :update_clinical_intake, mutation: Mutations::UpdateClinicalIntake
    field :update_insurance_details, mutation: Mutations::UpdateInsuranceDetails
    field :start_insurance_upload, mutation: Mutations::StartInsuranceUpload
    field :trigger_insurance_ocr, mutation: Mutations::TriggerInsuranceOcr
    field :recalculate_cost_estimate, mutation: Mutations::RecalculateCostEstimate
    field :update_scheduling_preferences, mutation: Mutations::UpdateSchedulingPreferences
    field :accept_consents, mutation: Mutations::AcceptConsents
    field :update_referral_step, mutation: Mutations::UpdateReferralStep
    field :submit_referral, mutation: Mutations::SubmitReferral
    field :start_screener_session, mutation: Mutations::StartScreenerSession
    field :append_screener_message, mutation: Mutations::AppendScreenerMessage
    field :complete_screener, mutation: Mutations::CompleteScreener
    field :request_referral_deletion, mutation: Mutations::RequestReferralDeletion
    field :send_support_message, mutation: Mutations::SendSupportMessage
    field :mark_notification_read, mutation: Mutations::MarkNotificationRead

    # Admin-facing mutations
    field :update_referral_status, mutation: Mutations::UpdateReferralStatus
    field :add_referral_note, mutation: Mutations::AddReferralNote
    field :create_resource_item, mutation: Mutations::CreateResourceItem
    field :update_resource_item, mutation: Mutations::UpdateResourceItem
    field :delete_resource_item, mutation: Mutations::DeleteResourceItem
    field :send_parent_notification, mutation: Mutations::SendParentNotification
    field :approve_referral_deletion, mutation: Mutations::ApproveReferralDeletion
    field :send_admin_chat_message, mutation: Mutations::SendAdminChatMessage
    field :reject_referral_deletion, mutation: Mutations::RejectReferralDeletion
    field :record_appointment_details, mutation: Mutations::RecordAppointmentDetails
    field :signup_parent, mutation: Mutations::SignupParent
    field :login_parent, mutation: Mutations::LoginParent
    field :login, mutation: Mutations::LoginParent
    field :logout, mutation: Mutations::LogoutParent
  end
end


