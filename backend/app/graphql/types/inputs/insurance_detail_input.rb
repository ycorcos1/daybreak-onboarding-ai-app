module Types
  module Inputs
    class InsuranceDetailInput < Types::BaseInputObject
      argument :insurance_status, String, required: true
      argument :insurer_name, String, required: false
      argument :plan_name, String, required: false
      argument :member_id, String, required: false
      argument :group_id, String, required: false
      argument :policyholder_name, String, required: false
      argument :coverage_phone, String, required: false
      argument :coverage_website, String, required: false
      argument :source, String, required: false
    end
  end
end


