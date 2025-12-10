module Types
  module Inputs
    class ParentInfoInput < Types::BaseInputObject
      argument :name, String, required: false
      argument :phone, String, required: false
      argument :address, String, required: false
      argument :language_preference, String, required: false
      argument :relationship_to_child, String, required: false
    end
  end
end


