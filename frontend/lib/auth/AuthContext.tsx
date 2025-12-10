import { useQuery } from "@apollo/client";
import {
  createContext,
  PropsWithChildren,
  useContext,
  useMemo,
} from "react";
import { ME_QUERY, MeQueryResult } from "../graphql/queries/me.graphql";

type AuthContextShape = {
  currentUser: MeQueryResult["me"];
  loading: boolean;
  refetchUser: () => Promise<void>;
};

const AuthContext = createContext<AuthContextShape | undefined>(undefined);

export function AuthProvider({ children }: PropsWithChildren) {
  const { data, loading, refetch } = useQuery<MeQueryResult>(ME_QUERY, {
    fetchPolicy: "cache-and-network",
    nextFetchPolicy: "cache-first",
    notifyOnNetworkStatusChange: true,
    returnPartialData: true,
  });

  const value = useMemo<AuthContextShape>(
    () => ({
      currentUser: data?.me ?? null,
      loading,
      refetchUser: async () => {
        await refetch();
      },
    }),
    [data?.me, loading, refetch],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return ctx;
}

