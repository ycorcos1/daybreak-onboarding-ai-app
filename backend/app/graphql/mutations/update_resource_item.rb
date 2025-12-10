module Mutations
  class UpdateResourceItem < Mutations::BaseMutation
    argument :id, ID, required: true
    argument :resource_input, Types::Inputs::ResourceItemInput, required: true

    field :resource_item, Types::ResourceItemType, null: true
    field :errors, [String], null: false

    def resolve(id:, resource_input:)
      require_admin!

      resource = ResourceItem.find_by(id: id)
      return { resource_item: nil, errors: ["Resource not found"] } unless resource

      if resource.update(resource_input.to_h)
        { resource_item: resource, errors: [] }
      else
        { resource_item: nil, errors: resource.errors.full_messages }
      end
    end
  end
end


