module Types
  class ResourceItemType < Types::BaseObject
    description "Parent-facing resource content"

    field :id, ID, null: false
    field :title, String, null: false
    field :body, String, null: true
    field :url, String, null: true
    field :resource_type, Types::ResourceTypeEnum, null: false
    field :tags, [String], null: false
    field :published, Boolean, null: false
    field :created_by_admin_id, ID, null: true
    field :created_at, GraphQL::Types::ISO8601DateTime, null: false
    field :updated_at, GraphQL::Types::ISO8601DateTime, null: false
  end
end


