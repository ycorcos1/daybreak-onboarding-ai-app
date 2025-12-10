class ApplicationController < ActionController::API
  include ActionController::Cookies
  include ActionController::RequestForgeryProtection
  protect_from_forgery with: :exception

  include Authenticatable
  include Authorizable

  before_action :set_csrf_cookie

  private

  # Expose CSRF token for client-side use while keeping protection enabled.
  def set_csrf_cookie
    cookies["CSRF-TOKEN"] = form_authenticity_token if protect_against_forgery?
  end
end
