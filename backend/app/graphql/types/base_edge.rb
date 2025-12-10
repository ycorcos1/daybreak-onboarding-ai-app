module Types
  class BaseEdge < GraphQL::Types::Relay::BaseEdge
    node_type(Types::BaseObject)
  end
end


