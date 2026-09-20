import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import {
  authRedirectTo,
  clearGoogleOAuthAttempt,
  isSupabaseConfigured,
  markGoogleOAuthAttempt,
  supabase,
} from "../lib/supabase";

const AuthContext = createContext(null);

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
import { remove } from "../lib/storage";
import { toUserMessage } from "../lib/errors";

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
  const identities = (user.identities ?? []).map((identity) => ({
    id: identity.identity_id || identity.id,
    provider: identity.provider,
    raw: identity,
  }));
  const providers = identities.map((identity) => identity.provider).filter(Boolean);
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
    identities,
    providers: uniqueProviders,
    canChangePassword: uniqueProviders.includes("email"),
    needsName: !name,
  };
}

function friendlyAuthError(error) {
  return toUserMessage(error, "Something went wrong. Please try again.");
}

function fail(error) {
  return { success: false, error: friendlyAuthError(error) };
}

export default function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(() => isSupabaseConfigured);

  useEffect(() => {
    if (!supabase) return undefined;

    let active = true;

    supabase.auth
      .getSession()
      .then(({ data }) => {
        if (!active) return;
        setUser(toSessionUser(data.session?.user ?? null));
        setLoading(false);
      })
      .catch(() => {
        if (!active) return;
        setUser(null);
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

    try {
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

      if (error) return fail(error);

      if (!data.session) {
        return { success: true, needsEmailConfirmation: true };
      }

      setUser(toSessionUser(data.user));
      return { success: true };
    } catch (error) {
      return fail(error);
    }
  }, []);

  const login = useCallback(async (email, password) => {
    if (!supabase) return NOT_CONFIGURED;

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: email.trim().toLowerCase(),
        password,
      });

      if (error) return fail(error);

      setUser(toSessionUser(data.user));
      return { success: true };
    } catch (error) {
      return fail(error);
    }
  }, []);

  const loginWithGoogle = useCallback(async () => {
    if (!supabase) return NOT_CONFIGURED;

    try {
      markGoogleOAuthAttempt();
      const { error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: authRedirectTo("/auth?mode=login&oauth=1"),
        },
      });

      if (error) {
        clearGoogleOAuthAttempt();
        return fail(error);
      }
      return { success: true };
    } catch (error) {
      clearGoogleOAuthAttempt();
      return fail(error);
    }
  }, []);

  const linkGoogle = useCallback(async () => {
    if (!supabase) return NOT_CONFIGURED;
    if (!user) return { success: false, error: "You are not signed in." };

    try {
      markGoogleOAuthAttempt();
      const { error } = await supabase.auth.linkIdentity({
        provider: "google",
        options: {
          redirectTo: authRedirectTo("/account"),
        },
      });

      if (error) {
        clearGoogleOAuthAttempt();
        return fail(error);
      }
      return { success: true };
    } catch (error) {
      clearGoogleOAuthAttempt();
      return fail(error);
    }
  }, [user]);

  const unlinkProvider = useCallback(
    async (provider) => {
      if (!supabase) return NOT_CONFIGURED;
      if (!user) return { success: false, error: "You are not signed in." };

      try {
        const methods = user.providers ?? [];
        if (methods.length <= 1) {
          return {
            success: false,
            error: "Keep at least one sign-in method so you can still access this account.",
          };
        }

        const identity = (user.identities ?? []).find((item) => item.provider === provider);
        if (!identity?.raw) {
          return { success: false, error: "That sign-in method is not connected." };
        }

        const { data, error } = await supabase.auth.unlinkIdentity(identity.raw);
        if (error) return fail(error);

        setUser(toSessionUser(data.user ?? null));
        return { success: true };
      } catch (error) {
        return fail(error);
      }
    },
    [user]
  );

  const logout = useCallback(async () => {
    try {
      if (supabase) await supabase.auth.signOut();
    } catch {

    }
    setUser(null);
  }, []);

  const updateProfile = useCallback(
    async ({ fullName }) => {
      if (!supabase) return NOT_CONFIGURED;
      if (!user) return { success: false, error: "You are not signed in." };

      try {
        const name = String(fullName ?? "").trim();
        if (name.length < 2) {
          return { success: false, error: "Enter your name (at least 2 characters)." };
        }

        const { data, error } = await supabase.auth.updateUser({
          data: { full_name: name },
        });
        if (error) return fail(error);

        setUser(toSessionUser(data.user));
        return { success: true };
      } catch (error) {
        return fail(error);
      }
    },
    [user]
  );

  const changePassword = useCallback(
    async (currentPassword, nextPassword) => {
      if (!supabase) return NOT_CONFIGURED;
      if (!user?.email) return { success: false, error: "You are not signed in." };

      try {
        const { error: reauthError } = await supabase.auth.signInWithPassword({
          email: user.email,
          password: currentPassword,
        });
        if (reauthError) {
          return { success: false, error: "Your current password is not correct." };
        }

        const { error } = await supabase.auth.updateUser({ password: nextPassword });
        if (error) return fail(error);

        return { success: true };
      } catch (error) {
        return fail(error);
      }
    },
    [user]
  );

  const requestPasswordReset = useCallback(async (email) => {
    if (!supabase) return NOT_CONFIGURED;

    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email.trim().toLowerCase(), {
        redirectTo: authRedirectTo("/auth?mode=update-password"),
      });

      if (error) return fail(error);
      return { success: true };
    } catch (error) {
      return fail(error);
    }
  }, []);

  const updatePassword = useCallback(async (nextPassword) => {
    if (!supabase) return NOT_CONFIGURED;

    try {
      const { error } = await supabase.auth.updateUser({ password: nextPassword });
      if (error) return fail(error);

      return { success: true };
    } catch (error) {
      return fail(error);
    }
  }, []);

  const deleteAccount = useCallback(async () => {
    if (!supabase) return NOT_CONFIGURED;
    if (!user?.email) return { success: false, error: "You are not signed in." };

    try {
      const { error } = await supabase.rpc("delete_own_account");
      if (error) {
        return {
          success: false,
          error:
            error.message?.includes("Could not find the function") || error.code === "PGRST202"
              ? "Account deletion isn’t set up yet. Run supabase/setup.sql in the Supabase SQL editor, then try again."
              : friendlyAuthError(error),
        };
      }

      try {
        await supabase.auth.signOut();
      } catch {

      }
      setUser(null);
      return { success: true };
    } catch (error) {
      return fail(error);
    }
  }, [user]);

  const value = useMemo(
    () => ({
      user,
      loading,
      configured: isSupabaseConfigured,
      signUp,
      login,
      loginWithGoogle,
      linkGoogle,
      unlinkProvider,
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
      linkGoogle,
      unlinkProvider,
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
