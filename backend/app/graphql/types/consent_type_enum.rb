module Types
  class ConsentTypeEnum < Types::BaseEnum
    value "TERMS_OF_USE", value: "terms_of_use"
    value "PRIVACY_POLICY", value: "privacy_policy"
    value "NON_EMERGENCY_ACKNOWLEDGMENT", value: "non_emergency_acknowledgment"
    value "TELEHEALTH_CONSENT", value: "telehealth_consent"
    value "GUARDIAN_AUTHORIZATION", value: "guardian_authorization"
  end
end


