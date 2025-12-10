module Mutations
  class CreateResourceItem < Mutations::BaseMutation
    argument :resource_input, Types::Inputs::ResourceItemInput, required: true

    field :resource_item, Types::ResourceItemType, null: true
    field :errors, [String], null: false

    def resolve(resource_input:)
      require_admin!

      resource = ResourceItem.new(resource_input.to_h.merge(created_by_admin_id: current_user.id))

      if resource.save
        { resource_item: resource, errors: [] }
      else
        { resource_item: nil, errors: resource.errors.full_messages }
      end
    end
  end
end


