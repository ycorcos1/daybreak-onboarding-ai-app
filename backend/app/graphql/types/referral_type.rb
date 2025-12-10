module Types
  class ReferralType < Types::BaseObject
    description "Referral tying all onboarding modules"

    field :id, ID, null: false
    field :child_id, ID, null: false
    field :status, Types::ReferralStatusEnum, null: false
    field :risk_flag, Boolean, null: false
    field :last_completed_step, String, null: true
    field :last_updated_step_at, GraphQL::Types::ISO8601DateTime, null: true
    field :packet_status, String, null: true
    field :deletion_requested_at, GraphQL::Types::ISO8601DateTime, null: true
    field :submitted_at, GraphQL::Types::ISO8601DateTime, null: true
    field :withdrawn_at, GraphQL::Types::ISO8601DateTime, null: true
    field :scheduled_date, GraphQL::Types::ISO8601Date, null: true
    field :scheduled_time, String, null: true
    field :clinician_name, String, null: true
    field :session_type, String, null: true
    field :next_step, String, null: true
    field :created_at, GraphQL::Types::ISO8601DateTime, null: false
    field :updated_at, GraphQL::Types::ISO8601DateTime, null: false

    field :child, Types::ChildType, null: false
    field :user, Types::UserType, null: false
    field :intake_response, Types::IntakeResponseType, null: true
    field :ai_screener_session, Types::AiScreenerSessionType, null: true
    field :insurance_detail, Types::InsuranceDetailType, null: true
    field :insurance_uploads, [Types::InsuranceUploadType], null: false
    field :cost_estimate, Types::CostEstimateType, null: true
    field :scheduling_preference, Types::SchedulingPreferenceType, null: true
    field :consent_records, [Types::ConsentRecordType], null: false
    field :referral_packet, Types::ReferralPacketType, null: true
    field :support_chats, [Types::SupportChatType], null: false
    field :referral_notes, [Types::ReferralNoteType], null: false
    field :notifications, [Types::NotificationType], null: false
  end
end


