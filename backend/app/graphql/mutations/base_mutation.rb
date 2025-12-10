module Mutations
  class BaseMutation < GraphQL::Schema::Mutation
    include AuthorizationHelpers
  end
end


