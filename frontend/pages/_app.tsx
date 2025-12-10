import "@/styles/globals.css";
import type { AppProps } from "next/app";
import { ApolloProvider } from "@apollo/client";
import client from "@/lib/graphql/client";
import { AuthProvider } from "@/lib/auth/AuthContext";
import Layout from "@/components/Layout";

export default function App({ Component, pageProps }: AppProps) {
  return (
    <ApolloProvider client={client}>
      <AuthProvider>
        <Layout>
          <Component {...pageProps} />
        </Layout>
      </AuthProvider>
    </ApolloProvider>
  );
}
