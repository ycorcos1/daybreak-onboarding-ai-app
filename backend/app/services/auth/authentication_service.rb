module Auth
  class AuthenticationService
    class AuthenticationError < StandardError; end

    def self.signup(email:, password:, name:, **attrs)
      user = User.new(
        email: email,
        password: password,
        password_confirmation: attrs[:password_confirmation],
        name: name,
        role: "parent",
        **attrs.slice(:phone, :address, :language_preference, :relationship_to_child)
      )

      user.save!
      user
    end

    def self.authenticate(email:, password:)
      user = User.find_by(email: email)
      return nil unless user&.authenticate(password)

      user
    end

    def self.generate_password_reset_token(_user)
      # Placeholder for future reset token generation.
      SecureRandom.hex(20)
    end

    def self.reset_password(token:, new_password:)
      raise AuthenticationError, "Not implemented reset flow" if token.blank?

      # Placeholder; full reset flow implemented in later tasks.
      raise AuthenticationError, "Password reset flow not available"
    end
  end
end

