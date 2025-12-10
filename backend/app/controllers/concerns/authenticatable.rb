module Authenticatable
  extend ActiveSupport::Concern

  included do
    before_action :set_current_user
    helper_method :current_user, :user_signed_in? if respond_to?(:helper_method, true)
  end

  def current_user
    @current_user
  end

  def user_signed_in?
    current_user.present?
  end

  def authenticate_user!
    return if user_signed_in?

    render json: { error: "Unauthorized" }, status: :unauthorized
  end

  def log_in(user)
    session[:user_id] = user.id
    @current_user = user
  end

  def log_out
    session.delete(:user_id)
    @current_user = nil
  end

  private

  def set_current_user
    return unless session[:user_id]

    @current_user ||= User.find_by(id: session[:user_id])
  end
end

