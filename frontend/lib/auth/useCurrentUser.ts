import { useAuth } from "./AuthContext";

export function useCurrentUser() {
  const { currentUser, loading } = useAuth();
  return { currentUser, loading };
}

export default useCurrentUser;

