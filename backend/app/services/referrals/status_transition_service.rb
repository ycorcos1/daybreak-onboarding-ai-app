module Referrals
  class StatusTransitionService
    class InvalidTransition < StandardError; end

    VALID_TRANSITIONS = {
      "draft" => %w[submitted],
      "submitted" => %w[in_review withdrawn],
      "in_review" => %w[ready_to_schedule submitted withdrawn],
      "ready_to_schedule" => %w[scheduled in_review withdrawn],
      "scheduled" => %w[closed withdrawn],
      "closed" => %w[withdrawn],
      "withdrawn" => [],
      "deleted" => []
    }.freeze

    STATUS_MESSAGES = {
      "in_review" => {
        title: "We’re reviewing your referral",
        message: "Our team has started reviewing your child’s referral."
      },
      "ready_to_schedule" => {
        title: "We’re working on scheduling",
        message: "We’re coordinating schedules based on your preferences."
      },
      "scheduled" => {
        title: "Your first session is scheduled",
        message: "We’ve scheduled your first session. We’ll share details with you."
      },
      "closed" => {
        title: "Referral closed",
        message: "This referral is now closed. Reach out if you have questions."
      },
      "withdrawn" => {
        title: "Referral withdrawn",
        message: "You’ve withdrawn this referral. Contact us anytime to restart."
      },
      "submitted" => {
        title: "Referral submitted",
        message: "We’ve received your referral and will begin review."
      }
    }.freeze

    def initialize(referral:, admin_user:)
      @referral = referral
      @admin_user = admin_user
    end

    def transition!(new_status)
      new_status = new_status.to_s
      allowed = Array(VALID_TRANSITIONS[@referral.status])
      allowed << "withdrawn" unless @referral.status == "deleted"
      raise InvalidTransition, "Cannot transition from #{@referral.status} to #{new_status}" unless allowed.include?(new_status)

      Referral.transaction do
        apply_status!(new_status)
        create_notification!(new_status)
      end

      @referral.reload
    end

    private

    def apply_status!(new_status)
      attrs = { status: new_status }

      if new_status == "submitted" && @referral.submitted_at.blank?
        attrs[:submitted_at] = Time.current
      end

      if new_status == "withdrawn"
        attrs[:withdrawn_at] = Time.current
      end

      @referral.update!(attrs)
    end

    def create_notification!(new_status)
      Notifications::Dispatcher.referral_status_changed(
        referral: @referral,
        user: @referral.user,
        new_status: new_status
      )
    end
  end
end


