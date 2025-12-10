module Api
  module V1
    class AuthController < ApplicationController
      before_action :authenticate_user!, only: %i[logout me]

      def signup
        user = Auth::AuthenticationService.signup(**signup_params.to_h.symbolize_keys)
        log_in(user)
        render json: { user: serialize_user(user) }, status: :created
      rescue ActiveRecord::RecordInvalid => e
        render json: { errors: e.record.errors.full_messages }, status: :unprocessable_entity
      end

      def login
        user = Auth::AuthenticationService.authenticate(
          email: login_params[:email],
          password: login_params[:password]
        )

        unless user
          return render json: { error: "Invalid email or password" }, status: :unauthorized
        end

        log_in(user)
        render json: { user: serialize_user(user) }
      end

      def logout
        log_out
        head :no_content
      end

      def me
        render json: { user: serialize_user(current_user) }
      end

      private

      def signup_params
        params.require(:user).permit(
          :email,
          :password,
          :password_confirmation,
          :name,
          :phone,
          :address,
          :language_preference,
          :relationship_to_child
        )
      end

      def login_params
        params.require(:user).permit(:email, :password)
      end

      def serialize_user(user)
        return nil unless user

        {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
          phone: user.phone,
          language_preference: user.language_preference,
          created_at: user.created_at
        }
      end
    end
  end
end

