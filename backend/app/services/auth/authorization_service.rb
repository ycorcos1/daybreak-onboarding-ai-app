module Auth
  class AuthorizationService
    class NotAuthorizedError < StandardError; end

    def self.require_parent!(user)
      raise NotAuthorizedError, "Forbidden" unless user&.parent?
    end

    def self.require_admin!(user)
      raise NotAuthorizedError, "Forbidden" unless user&.admin?
    end

    def self.can_access_referral?(user:, referral:)
      return false if user.nil? || referral.nil?
      return true if user.admin?

      referral.user&.id == user.id
    end

    def self.can_modify_referral?(user:, referral:)
      can_access_referral?(user: user, referral: referral)
    end
  end
end

