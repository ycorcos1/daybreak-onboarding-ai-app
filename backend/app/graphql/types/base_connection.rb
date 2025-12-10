module Types
  class BaseConnection < GraphQL::Types::Relay::BaseConnection
    edge_type(Types::BaseEdge)
  end
end


