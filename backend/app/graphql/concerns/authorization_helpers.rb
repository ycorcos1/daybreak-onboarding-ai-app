module AuthorizationHelpers
  class NotAuthenticatedError < StandardError; end
  class NotAuthorizedError < StandardError; end

  def current_user
    context[:current_user]
  end

  def require_authentication!
    raise NotAuthenticatedError, "You must be logged in" unless current_user
  end

  def require_parent!
    require_authentication!
    raise NotAuthorizedError, "Parent access required" unless current_user&.parent?
  end

  def require_admin!
    require_authentication!
    raise NotAuthorizedError, "Admin access required" unless current_user&.admin?
  end

  def ensure_ownership!(resource)
    require_parent!
    raise NotAuthorizedError, "You don't have access to this resource" unless resource_belongs_to_current_user?(resource)
  end

  private

  def resource_belongs_to_current_user?(resource)
    case resource
    when Child
      resource.user_id == current_user.id
    when Referral
      resource.child.user_id == current_user.id
    when Notification
      resource.user_id == current_user.id
    when SupportChat
      resource.parent_user_id == current_user.id
    else
      false
    end
  end
end

