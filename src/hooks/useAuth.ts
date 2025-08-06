import { useEffect } from "react";
import { AuthService } from "../services/authService";
import { useAppStore } from "../store/useAppStore";

export const useAuth = () => {
  const { user, setUser, setLoading, setError } =
    useAppStore();

  useEffect(() => {
    console.log("useAuth: Setting up auth state listener");
    const unsubscribe = AuthService.onAuthStateChange(
      (user) => {
        console.log("useAuth: Auth state changed", {
          user: user?.uid,
        });
        setUser(user);
        setLoading(false);
      }
    );

    return unsubscribe;
  }, [setUser, setLoading]);

  const signInWithGoogle = async () => {
    setLoading(true);
    setError(null);
    try {
      const user = await AuthService.signInWithGoogle();
      setUser(user);
    } catch (error) {
      setError(
        error instanceof Error
          ? error.message
          : "Authentication failed"
      );
    } finally {
      setLoading(false);
    }
  };

  const signOut = async () => {
    setLoading(true);
    setError(null);
    try {
      await AuthService.signOut();
      setUser(null);
    } catch (error) {
      setError(
        error instanceof Error
          ? error.message
          : "Sign out failed"
      );
    } finally {
      setLoading(false);
    }
  };

  return {
    user,
    isAuthenticated: !!user,
    isLoading: useAppStore((state) => state.isLoading),
    error: useAppStore((state) => state.error),
    signInWithGoogle,
    signOut,
  };
};
