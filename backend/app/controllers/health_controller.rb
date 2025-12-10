class HealthController < ApplicationController
  def index
    render json: {
      status: "ok",
      service: "daybreak-onboarding-api",
      timestamp: Time.current.iso8601
    }
  end
end

