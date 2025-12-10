module Mutations
  class DeleteResourceItem < Mutations::BaseMutation
    argument :id, ID, required: true

    field :success, Boolean, null: false
    field :errors, [String], null: false

    def resolve(id:)
      require_admin!

      resource = ResourceItem.find_by(id: id)
      return { success: false, errors: ["Resource not found"] } unless resource

      if resource.destroy
        { success: true, errors: [] }
      else
        { success: false, errors: resource.errors.full_messages }
      end
    end
  end
end


