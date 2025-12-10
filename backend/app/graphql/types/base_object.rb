module Types
  class BaseObject < GraphQL::Schema::Object
    include AuthorizationHelpers

    field_class Types::BaseField
    edge_type_class Types::BaseEdge
    connection_type_class Types::BaseConnection
  end
end


