# Be sure to restart your server when you modify this file.

# Configure parameters to be partially matched (e.g. passw matches password) and filtered from the log file.
# Use this to limit dissemination of sensitive information.
# See the ActiveSupport::ParameterFilter documentation for supported notations and behaviors.
Rails.application.config.filter_parameters += [
  :passw, :password, :password_confirmation, :current_password,
  :email, :phone, :phone_number, :mobile,
  :secret, :token, :_key, :crypt, :salt, :certificate, :otp,
  :ssn, :social_security_number, :dob, :date_of_birth,
  :address, :street, :street_address, :city, :state, :zip, :zip_code, :postal_code,
  :name, :full_name, :first_name, :last_name, :parent_name, :child_name,
  :insurer_name, :plan_name, :member_id, :group_id, :policyholder_name, :insurance_phone, :coverage_phone,
  :message, :message_text, :content, :body, :transcript, :transcript_jsonb, :screener_message, :chat_message,
  :note_text, :internal_notes, :responses, :intake_responses,
  # Catch-alls for secrets/keys/tokens that may appear in params
  /token/i, /secret/i, /key/i, /authorization/i
]
