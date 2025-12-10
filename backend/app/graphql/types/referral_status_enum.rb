module Types
  class ReferralStatusEnum < Types::BaseEnum
    value "DRAFT", value: "draft"
    value "SUBMITTED", value: "submitted"
    value "IN_REVIEW", value: "in_review"
    value "READY_TO_SCHEDULE", value: "ready_to_schedule"
    value "SCHEDULED", value: "scheduled"
    value "CLOSED", value: "closed"
    value "WITHDRAWN", value: "withdrawn"
    value "DELETED", value: "deleted"
  end
end


