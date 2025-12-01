import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
} from "react";
import { User, Session } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

// ---------------------- Interfaces ----------------------

interface Profile {
  storage_used: number | null;
  storage_limit: number | null;
  subscription_tier: string | null;
}

interface AuthContextType {
  user: User | null;
  session: Session | null;
  profile: Profile | null;
  loading: boolean;

  signUp: (
    email: string,
    password: string,
    displayName?: string
  ) => Promise<{ error: any }>;

  signIn: (email: string, password: string) => Promise<{ error: any }>;
  signOut: () => Promise<{ error: any }>;
  signInWithGoogle: () => Promise<{ error: any }>;
  refreshProfile: () => Promise<void>;

  setUserPlan: (userId: string, plan: "basic" | "premium") => Promise<void>;
}

// ---------------------- Context ----------------------

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context)
    throw new Error("useAuth must be used inside an AuthProvider component");
  return context;
};

// ---------------------- Provider ----------------------

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);

  const { toast } = useToast();

  // ------------------ Internal Helpers ------------------

  const handleAuthChange = useCallback((session: Session | null) => {
    setSession(session);
    setUser(session?.user ?? null);
    setLoading(false);
  }, []);

  const fetchProfile = useCallback(async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from("profiles")
        .select("storage_used, storage_limit, subscription_tier")
        .eq("id", userId)
        .maybeSingle();

      if (error) throw error;
      setProfile(data ?? null);
    } catch (err: any) {
      console.error("Error fetching profile:", err.message);
      setProfile(null);
    }
  }, []);

  const refreshProfile = useCallback(async () => {
    if (!user?.id) return;
    await fetchProfile(user.id);

    // Notify UI that subscription changed (for removing pro badges instantly)
    window.dispatchEvent(new Event("subscription-updated"));
  }, [user, fetchProfile]);

  // ------------------ Auth Listener ------------------

  useEffect(() => {
    let active = true;

    supabase.auth.getSession().then(({ data, error }) => {
      if (!active) return;
      if (error) console.error("Session load error:", error.message);
      handleAuthChange(data?.session ?? null);
    });

    const { data: listener } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        handleAuthChange(session);
      }
    );

    return () => {
      active = false;
      listener.subscription.unsubscribe();
    };
  }, [handleAuthChange]);

  // Fetch profile whenever user changes
  useEffect(() => {
    if (user?.id) fetchProfile(user.id);
    else setProfile(null);
  }, [user, fetchProfile]);

  // Auto-refresh profile when window gains focus (e.g., after returning from payment)
  useEffect(() => {
    const onFocus = () => {
      if (user?.id) fetchProfile(user.id);
    };
    window.addEventListener("focus", onFocus);
    return () => window.removeEventListener("focus", onFocus);
  }, [user, fetchProfile]);

  // ------------------ Auth Methods ------------------

  const getRedirectUrl = () =>
    window.location.hostname === "localhost"
      ? `${window.location.origin}/`
      : `https://${window.location.hostname}/`;

  const signUp = async (
    email: string,
    password: string,
    displayName?: string
  ) => {
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: getRedirectUrl(),
        data: { display_name: displayName || email.split("@")[0] },
      },
    });

    if (error) {
      toast({
        variant: "destructive",
        title: "Sign up failed",
        description: error.message,
      });
    } else {
      toast({
        title: "Account created!",
        description: "Check your email to verify your account.",
      });
    }

    return { error };
  };

  const signIn = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({ email, password });

    if (error) {
      toast({
        variant: "destructive",
        title: "Sign in failed",
        description: error.message,
      });
    }

    return { error };
  };

  const signInWithGoogle = async () => {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo: getRedirectUrl() },
    });

    if (error) {
      toast({
        variant: "destructive",
        title: "Google sign-in failed",
        description: error.message,
      });
    }

    return { error };
  };

  const signOut = async () => {
    const { error } = await supabase.auth.signOut();

    if (error) {
      toast({
        variant: "destructive",
        title: "Sign out failed",
        description: error.message,
      });
    } else {
      toast({
        title: "Logged out",
        description: "You have signed out successfully.",
      });
    }

    return { error };
  };

  // ------------------ Manual Plan Control ------------------

  const setUserPlan = async (userId: string, plan: "basic" | "premium") => {
    try {
      const { error } = await supabase
        .from("profiles")
        .update({
          subscription_tier: plan,
          storage_limit: plan === "premium" ? 1000 : 2, // Adjust limits
        })
        .eq("id", userId);

      if (error) throw error;

      // Refresh profile if current user
      if (user?.id === userId) await refreshProfile();

      toast({
        title: "Plan updated",
        description: `User is now ${plan.toUpperCase()}`,
      });
    } catch (err: any) {
      toast({
        variant: "destructive",
        title: "Plan update failed",
        description: err.message,
      });
    }
  };

  // ------------------ Context Value ------------------

  const value: AuthContextType = {
    user,
    session,
    profile,
    loading,
    signUp,
    signIn,
    signOut,
    signInWithGoogle,
    refreshProfile,
    setUserPlan,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
