module Types
  module Inputs
    class ResourceItemInput < Types::BaseInputObject
      argument :title, String, required: true
      argument :body, String, required: false
      argument :url, String, required: false
      argument :resource_type, Types::ResourceTypeEnum, required: true
      argument :tags, [String], required: false
      argument :published, Boolean, required: false
    end
  end
end


