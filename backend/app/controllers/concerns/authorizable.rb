module Authorizable
  extend ActiveSupport::Concern

  included do
    rescue_from Auth::AuthorizationService::NotAuthorizedError, with: :render_forbidden
  end

  def require_parent!
    Auth::AuthorizationService.require_parent!(current_user)
  end

  def require_admin!
    Auth::AuthorizationService.require_admin!(current_user)
  end

  def authorize_referral_access!(referral)
    return if Auth::AuthorizationService.can_access_referral?(user: current_user, referral: referral)

    render json: { error: "Forbidden" }, status: :forbidden
  end

  def authorize_referral_modification!(referral)
    return if Auth::AuthorizationService.can_modify_referral?(user: current_user, referral: referral)

    render json: { error: "Forbidden" }, status: :forbidden
  end

  private

  def render_forbidden
    render json: { error: "Forbidden" }, status: :forbidden
  end
end

