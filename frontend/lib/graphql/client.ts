import { ApolloClient, HttpLink, InMemoryCache } from "@apollo/client";

const graphqlUri =
  process.env.NEXT_PUBLIC_GRAPHQL_ENDPOINT || "http://localhost:3001/graphql";

const link = new HttpLink({
  uri: graphqlUri,
  credentials: "include",
});

const client = new ApolloClient({
  link,
  cache: new InMemoryCache(),
});

export default client;

