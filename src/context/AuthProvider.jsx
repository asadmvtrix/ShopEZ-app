import { useCallback, useEffect, useMemo, useState } from "react";
import { AuthContext } from "./auth-context";
import { authRedirectTo, isSupabaseConfigured, supabase } from "../lib/supabase";
import { clearGoogleOAuthAttempt, markGoogleOAuthAttempt } from "../lib/oauth";
import { remove } from "../lib/storage";

// Drop the old localStorage auth keys so a previous sandbox session cannot linger.
remove("shopez.users");
remove("shopez.session");

const NOT_CONFIGURED = {
  success: false,
  error:
    "Supabase is not configured. Add VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY to a .env file, then restart the dev server.",
};

function readDisplayName(user) {
  const meta = user.user_metadata ?? {};
  return String(meta.full_name || meta.name || meta.given_name || "").trim();
}

function toSessionUser(user) {
  if (!user) return null;
  const providers = (user.identities ?? [])
    .map((identity) => identity.provider)
    .filter(Boolean);
  const uniqueProviders = [
    ...new Set(providers.length ? providers : [user.app_metadata?.provider].filter(Boolean)),
  ];
  const name = readDisplayName(user);
  const meta = user.user_metadata ?? {};

  return {
    id: user.id,
    email: user.email ?? "",
    name,
    avatarUrl: meta.avatar_url || meta.picture || null,
    createdAt: user.created_at ?? null,
    providers: uniqueProviders,
    canChangePassword: uniqueProviders.includes("email"),
    needsName: !name,
  };
}

function friendlyAuthError(error) {
  const message = error?.message ?? "Something went wrong.";
  const normalised = message.toLowerCase();

  if (normalised.includes("invalid login credentials")) {
    return "Incorrect email or password.";
  }
  if (normalised.includes("user already registered")) {
    return "An account with this email already exists.";
  }
  if (normalised.includes("email not confirmed")) {
    return "Check your inbox for the confirmation link, then sign in.";
  }
  if (normalised.includes("password should be at least")) {
    return message;
  }
  if (normalised.includes("new password should be different")) {
    return "The new password matches the current one.";
  }
  if (normalised.includes("same password")) {
    return "The new password matches the current one.";
  }

  return message;
}

export default function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(() => isSupabaseConfigured);

  useEffect(() => {
    if (!supabase) return undefined;

    let active = true;

    supabase.auth.getSession().then(({ data }) => {
      if (!active) return;
      setUser(toSessionUser(data.session?.user ?? null));
      setLoading(false);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(toSessionUser(session?.user ?? null));
      setLoading(false);
    });

    return () => {
      active = false;
      subscription.unsubscribe();
    };
  }, []);

  const signUp = useCallback(async (email, password, { fullName } = {}) => {
    if (!supabase) return NOT_CONFIGURED;

    const name = String(fullName ?? "").trim();
    if (name.length < 2) {
      return { success: false, error: "Enter your name (at least 2 characters)." };
    }

    const { data, error } = await supabase.auth.signUp({
      email: email.trim().toLowerCase(),
      password,
      options: {
        data: { full_name: name },
        emailRedirectTo: authRedirectTo("/auth?mode=login&verified=1"),
      },
    });

    if (error) return { success: false, error: friendlyAuthError(error) };

    if (!data.session) {
      return { success: true, needsEmailConfirmation: true };
    }

    setUser(toSessionUser(data.user));
    return { success: true };
  }, []);

  const login = useCallback(async (email, password) => {
    if (!supabase) return NOT_CONFIGURED;

    const { data, error } = await supabase.auth.signInWithPassword({
      email: email.trim().toLowerCase(),
      password,
    });

    if (error) return { success: false, error: friendlyAuthError(error) };

    setUser(toSessionUser(data.user));
    return { success: true };
  }, []);

  const loginWithGoogle = useCallback(async () => {
    if (!supabase) return NOT_CONFIGURED;

    markGoogleOAuthAttempt();
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: authRedirectTo("/auth?mode=login&oauth=1"),
      },
    });

    if (error) {
      clearGoogleOAuthAttempt();
      return { success: false, error: friendlyAuthError(error) };
    }
    return { success: true };
  }, []);

  const logout = useCallback(async () => {
    if (supabase) await supabase.auth.signOut();
    setUser(null);
  }, []);

  const updateProfile = useCallback(async ({ fullName }) => {
    if (!supabase) return NOT_CONFIGURED;
    if (!user) return { success: false, error: "You are not signed in." };

    const name = String(fullName ?? "").trim();
    if (name.length < 2) {
      return { success: false, error: "Enter your name (at least 2 characters)." };
    }

    const { data, error } = await supabase.auth.updateUser({
      data: { full_name: name },
    });
    if (error) return { success: false, error: friendlyAuthError(error) };

    setUser(toSessionUser(data.user));
    return { success: true };
  }, [user]);

  const changePassword = useCallback(
    async (currentPassword, nextPassword) => {
      if (!supabase) return NOT_CONFIGURED;
      if (!user?.email) return { success: false, error: "You are not signed in." };

      const { error: reauthError } = await supabase.auth.signInWithPassword({
        email: user.email,
        password: currentPassword,
      });
      if (reauthError) {
        return { success: false, error: "Your current password is not correct." };
      }

      const { error } = await supabase.auth.updateUser({ password: nextPassword });
      if (error) return { success: false, error: friendlyAuthError(error) };

      return { success: true };
    },
    [user]
  );

  const requestPasswordReset = useCallback(async (email) => {
    if (!supabase) return NOT_CONFIGURED;

    const { error } = await supabase.auth.resetPasswordForEmail(email.trim().toLowerCase(), {
      redirectTo: authRedirectTo("/auth?mode=update-password"),
    });

    if (error) return { success: false, error: friendlyAuthError(error) };
    return { success: true };
  }, []);

  const updatePassword = useCallback(async (nextPassword) => {
    if (!supabase) return NOT_CONFIGURED;

    const { error } = await supabase.auth.updateUser({ password: nextPassword });
    if (error) return { success: false, error: friendlyAuthError(error) };

    return { success: true };
  }, []);

  const deleteAccount = useCallback(async () => {
    if (!supabase) return NOT_CONFIGURED;
    if (!user?.email) return { success: false, error: "You are not signed in." };

    const { error } = await supabase.rpc("delete_own_account");
    if (error) {
      return {
        success: false,
        error:
          error.message?.includes("Could not find the function") || error.code === "PGRST202"
            ? "Account deletion is not set up yet. Run supabase/setup.sql in the Supabase SQL editor, then try again."
            : friendlyAuthError(error),
      };
    }

    await supabase.auth.signOut();
    setUser(null);
    return { success: true };
  }, [user]);

  const value = useMemo(
    () => ({
      user,
      loading,
      configured: isSupabaseConfigured,
      signUp,
      login,
      loginWithGoogle,
      logout,
      updateProfile,
      changePassword,
      requestPasswordReset,
      updatePassword,
      deleteAccount,
    }),
    [
      user,
      loading,
      signUp,
      login,
      loginWithGoogle,
      logout,
      updateProfile,
      changePassword,
      requestPasswordReset,
      updatePassword,
      deleteAccount,
    ]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
