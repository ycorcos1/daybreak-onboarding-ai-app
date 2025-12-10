class DaybreakSchema < GraphQL::Schema
  mutation(Types::MutationType)
  query(Types::QueryType)

  rescue_from AuthorizationHelpers::NotAuthenticatedError do |error|
    raise GraphQL::ExecutionError, error.message
  end

  rescue_from AuthorizationHelpers::NotAuthorizedError do |error|
    raise GraphQL::ExecutionError, error.message
  end

  rescue_from ActiveRecord::RecordNotFound do |_error|
    raise GraphQL::ExecutionError, "Record not found"
  end
end


