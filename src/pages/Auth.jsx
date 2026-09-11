import { useEffect, useRef, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { Link as RouterLink, useNavigate, useSearchParams } from "react-router-dom";
import Alert from "@mui/material/Alert";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import CircularProgress from "@mui/material/CircularProgress";
import Container from "@mui/material/Container";
import IconButton from "@mui/material/IconButton";
import InputAdornment from "@mui/material/InputAdornment";
import Link from "@mui/material/Link";
import Paper from "@mui/material/Paper";
import Stack from "@mui/material/Stack";
import Tab from "@mui/material/Tab";
import Tabs from "@mui/material/Tabs";
import TextField from "@mui/material/TextField";
import Typography from "@mui/material/Typography";
import VisibilityOffOutlinedIcon from "@mui/icons-material/VisibilityOffOutlined";
import VisibilityOutlinedIcon from "@mui/icons-material/VisibilityOutlined";
import BrandMark from "../components/BrandMark";
import GoogleGlyph from "../components/GoogleGlyph";
import { useAuth } from "../context/auth-context";
import { markAppEnter } from "../hooks/useWarmReveal";
import { setFlash } from "../lib/flash";
import { clearGoogleOAuthAttempt, consumeGoogleOAuthAttempt } from "../lib/oauth";
import { supabase } from "../lib/supabase";

const MIN_PASSWORD_LENGTH = 8;
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const emailRules = {
  required: "Enter your email address.",
  pattern: { value: EMAIL_PATTERN, message: "That is not a valid email address." },
};

const nameRules = {
  required: "Enter your name.",
  minLength: { value: 2, message: "Use at least 2 characters." },
};

const newPasswordRules = {
  required: "Enter a password.",
  minLength: {
    value: MIN_PASSWORD_LENGTH,
    message: `Use at least ${MIN_PASSWORD_LENGTH} characters.`,
  },
};

function usePasswordVisibility() {
  const [visible, setVisible] = useState(false);

  const adornment = (
    <InputAdornment position="end">
      <IconButton
        size="small"
        edge="end"
        onClick={() => setVisible((current) => !current)}
        aria-label={visible ? "Hide password" : "Show password"}
      >
        {visible ? (
          <VisibilityOffOutlinedIcon fontSize="small" />
        ) : (
          <VisibilityOutlinedIcon fontSize="small" />
        )}
      </IconButton>
    </InputAdornment>
  );

  return { type: visible ? "text" : "password", adornment };
}

function goIntoApp(navigate, redirectTo, { needsName = false, flash } = {}) {
  clearGoogleOAuthAttempt();
  if (flash) setFlash(flash);
  markAppEnter();
  if (needsName) {
    navigate("/account?setup=1", { replace: true });
    return;
  }
  navigate(redirectTo ? decodeURIComponent(redirectTo) : "/", { replace: true });
}

function CredentialsForm({ isSignUp, redirectTo, verifiedNotice, onNeedsConfirmation }) {
  const navigate = useNavigate();
  const { signUp, login, loginWithGoogle } = useAuth();
  const [formError, setFormError] = useState(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get("oauth") === "1") return null;
    return consumeGoogleOAuthAttempt() ? "Google sign-in was cancelled." : null;
  });
  const [googleBusy, setGoogleBusy] = useState(false);
  const password = usePasswordVisibility();

  const {
    control,
    handleSubmit,
    getValues,
    formState: { isSubmitting },
  } = useForm({
    defaultValues: { fullName: "", email: "", password: "", confirmPassword: "" },
    mode: "onTouched",
  });

  // Coming back from a closed Google tab can restore this page with a stuck spinner.
  useEffect(() => {
    const clearBusy = () => setGoogleBusy(false);
    const onPageShow = (event) => {
      clearBusy();
      if (!event.persisted) return;
      if (new URLSearchParams(window.location.search).get("oauth") === "1") return;
      if (consumeGoogleOAuthAttempt()) {
        setFormError("Google sign-in was cancelled.");
      }
    };

    window.addEventListener("pageshow", onPageShow);
    window.addEventListener("focus", clearBusy);
    const onVisible = () => {
      if (document.visibilityState === "visible") clearBusy();
    };
    document.addEventListener("visibilitychange", onVisible);

    return () => {
      window.removeEventListener("pageshow", onPageShow);
      window.removeEventListener("focus", clearBusy);
      document.removeEventListener("visibilitychange", onVisible);
    };
  }, []);

  async function onSubmit(values) {
    setFormError(null);

    const result = isSignUp
      ? await signUp(values.email, values.password, { fullName: values.fullName })
      : await login(values.email, values.password);

    if (!result.success) {
      setFormError(result.error);
      return;
    }

    if (result.needsEmailConfirmation) {
      onNeedsConfirmation(values.email.trim().toLowerCase());
      return;
    }

    goIntoApp(navigate, redirectTo, {
      flash: isSignUp ? "Account created successfully." : "Signed in successfully.",
    });
  }

  async function onGoogle() {
    setFormError(null);
    setGoogleBusy(true);
    const result = await loginWithGoogle();
    if (!result.success) {
      setGoogleBusy(false);
      setFormError(result.error);
    }
  }

  return (
    <Box component="form" onSubmit={handleSubmit(onSubmit)} noValidate sx={{ p: 3 }}>
      {verifiedNotice && (
        <Alert severity="success" sx={{ mb: 2.5 }}>
          Email verified. Sign in to continue.
        </Alert>
      )}
      {formError && (
        <Alert severity="warning" sx={{ mb: 2.5 }}>
          {formError}
        </Alert>
      )}

      <Stack spacing={2}>
        <Button
          type="button"
          variant="outlined"
          size="large"
          fullWidth
          onClick={onGoogle}
          disabled={googleBusy || isSubmitting}
          startIcon={googleBusy ? <CircularProgress size={18} color="inherit" /> : <GoogleGlyph />}
          sx={{ bgcolor: "background.paper" }}
        >
          Continue with Google
        </Button>

        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: "1fr auto 1fr",
            alignItems: "center",
            gap: 1.5,
          }}
        >
          <Box sx={{ borderBottom: 1, borderColor: "divider" }} />
          <Typography variant="caption" color="text.secondary">
            or
          </Typography>
          <Box sx={{ borderBottom: 1, borderColor: "divider" }} />
        </Box>

        {isSignUp && (
          <Controller
            name="fullName"
            control={control}
            rules={nameRules}
            render={({ field, fieldState }) => (
              <TextField
                {...field}
                label="Your name"
                autoComplete="name"
                error={Boolean(fieldState.error)}
                helperText={fieldState.error?.message ?? "Shown on your account"}
              />
            )}
          />
        )}

        <Controller
          name="email"
          control={control}
          rules={emailRules}
          render={({ field, fieldState }) => (
            <TextField
              {...field}
              label="Email"
              type="email"
              autoComplete="email"
              error={Boolean(fieldState.error)}
              helperText={fieldState.error?.message ?? " "}
            />
          )}
        />

        <Controller
          name="password"
          control={control}
          rules={isSignUp ? newPasswordRules : { required: "Enter your password." }}
          render={({ field, fieldState }) => (
            <TextField
              {...field}
              label="Password"
              type={password.type}
              autoComplete={isSignUp ? "new-password" : "current-password"}
              error={Boolean(fieldState.error)}
              helperText={
                fieldState.error?.message ??
                (isSignUp ? `At least ${MIN_PASSWORD_LENGTH} characters` : " ")
              }
              slotProps={{ input: { endAdornment: password.adornment } }}
            />
          )}
        />

        {isSignUp && (
          <Controller
            name="confirmPassword"
            control={control}
            rules={{
              validate: (value) =>
                value === getValues("password") || "The two passwords do not match.",
            }}
            render={({ field, fieldState }) => (
              <TextField
                {...field}
                label="Confirm password"
                type={password.type}
                autoComplete="new-password"
                error={Boolean(fieldState.error)}
                helperText={fieldState.error?.message ?? " "}
              />
            )}
          />
        )}

        <Button
          type="submit"
          variant="contained"
          size="large"
          disabled={isSubmitting || googleBusy}
          startIcon={isSubmitting ? <CircularProgress size={18} color="inherit" /> : null}
        >
          {isSignUp ? "Create account" : "Sign in"}
        </Button>

        {!isSignUp && (
          <Box sx={{ textAlign: "center" }}>
            <Link
              component={RouterLink}
              to={`/auth?mode=reset${redirectTo ? `&redirect=${redirectTo}` : ""}`}
              variant="body2"
            >
              Forgot your password?
            </Link>
          </Box>
        )}
      </Stack>
    </Box>
  );
}

function ResetRequestForm({ redirectTo }) {
  const { requestPasswordReset } = useAuth();
  const [formError, setFormError] = useState(null);
  const [sent, setSent] = useState(false);

  const {
    control,
    handleSubmit,
    formState: { isSubmitting },
  } = useForm({
    defaultValues: { email: "" },
    mode: "onTouched",
  });

  async function onSubmit(values) {
    setFormError(null);
    const result = await requestPasswordReset(values.email);
    if (!result.success) {
      setFormError(result.error);
      return;
    }
    setSent(true);
  }

  if (sent) {
    return (
      <Box sx={{ p: 3 }}>
        <Alert severity="success" sx={{ mb: 2 }}>
          Check your email for a reset link.
        </Alert>
        <Button
          component={RouterLink}
          to={`/auth?mode=login${redirectTo ? `&redirect=${redirectTo}` : ""}`}
          variant="contained"
          fullWidth
        >
          Back to sign in
        </Button>
      </Box>
    );
  }

  return (
    <Box component="form" onSubmit={handleSubmit(onSubmit)} noValidate sx={{ p: 3 }}>
      {formError && (
        <Alert severity="error" sx={{ mb: 2.5 }}>
          {formError}
        </Alert>
      )}

      <Stack spacing={2}>
        <Controller
          name="email"
          control={control}
          rules={emailRules}
          render={({ field, fieldState }) => (
            <TextField
              {...field}
              label="Email"
              type="email"
              autoComplete="email"
              error={Boolean(fieldState.error)}
              helperText={fieldState.error?.message ?? " "}
            />
          )}
        />

        <Button
          type="submit"
          variant="contained"
          size="large"
          disabled={isSubmitting}
          startIcon={isSubmitting ? <CircularProgress size={18} color="inherit" /> : null}
        >
          Send reset link
        </Button>

        <Box sx={{ textAlign: "center" }}>
          <Link
            component={RouterLink}
            to={`/auth?mode=login${redirectTo ? `&redirect=${redirectTo}` : ""}`}
            variant="body2"
          >
            Back to sign in
          </Link>
        </Box>
      </Stack>
    </Box>
  );
}

function UpdatePasswordForm({ redirectTo }) {
  const navigate = useNavigate();
  const { user, updatePassword } = useAuth();
  const [formError, setFormError] = useState(null);
  const password = usePasswordVisibility();

  const {
    control,
    handleSubmit,
    getValues,
    formState: { isSubmitting },
  } = useForm({
    defaultValues: { password: "", confirmPassword: "" },
    mode: "onTouched",
  });

  async function onSubmit(values) {
    setFormError(null);
    const result = await updatePassword(values.password);
    if (!result.success) {
      setFormError(result.error);
      return;
    }
    markAppEnter();
    setFlash("Password updated successfully.");
    navigate(redirectTo ? decodeURIComponent(redirectTo) : "/account", { replace: true });
  }

  if (!user) {
    return (
      <Box sx={{ p: 3 }}>
        <Alert severity="warning" sx={{ mb: 2 }}>
          Open the reset link from your email first.
        </Alert>
        <Button component={RouterLink} to="/auth?mode=reset" variant="outlined" fullWidth>
          Request a new link
        </Button>
      </Box>
    );
  }

  return (
    <Box component="form" onSubmit={handleSubmit(onSubmit)} noValidate sx={{ p: 3 }}>
      {formError && (
        <Alert severity="error" sx={{ mb: 2.5 }}>
          {formError}
        </Alert>
      )}

      <Stack spacing={2}>
        <Controller
          name="password"
          control={control}
          rules={newPasswordRules}
          render={({ field, fieldState }) => (
            <TextField
              {...field}
              label="New password"
              type={password.type}
              autoComplete="new-password"
              error={Boolean(fieldState.error)}
              helperText={fieldState.error?.message ?? `At least ${MIN_PASSWORD_LENGTH} characters`}
              slotProps={{ input: { endAdornment: password.adornment } }}
            />
          )}
        />

        <Controller
          name="confirmPassword"
          control={control}
          rules={{
            validate: (value) =>
              value === getValues("password") || "The two passwords do not match.",
          }}
          render={({ field, fieldState }) => (
            <TextField
              {...field}
              label="Confirm new password"
              type={password.type}
              autoComplete="new-password"
              error={Boolean(fieldState.error)}
              helperText={fieldState.error?.message ?? " "}
            />
          )}
        />

        <Button
          type="submit"
          variant="contained"
          size="large"
          disabled={isSubmitting}
          startIcon={isSubmitting ? <CircularProgress size={18} color="inherit" /> : null}
        >
          Save new password
        </Button>
      </Stack>
    </Box>
  );
}

function readAuthLinkType() {
  const hash = window.location.hash.startsWith("#")
    ? window.location.hash.slice(1)
    : window.location.hash;
  return new URLSearchParams(hash).get("type");
}

export default function Auth() {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const { user, loading, configured } = useAuth();
  const [pendingEmail, setPendingEmail] = useState(null);
  const [verifiedFromLink, setVerifiedFromLink] = useState(() => readAuthLinkType() === "signup");

  const requested = searchParams.get("mode");
  const mode =
    requested === "login" || requested === "reset" || requested === "update-password"
      ? requested
      : "signup";
  const redirectTo = searchParams.get("redirect");
  // Keep verified banner after we strip ?verified=1 from the URL.
  const [sawVerifiedParam] = useState(() => searchParams.get("verified") === "1");
  const verifiedNotice =
    verifiedFromLink || sawVerifiedParam || searchParams.get("verified") === "1";
  const fromOAuth = searchParams.get("oauth") === "1";
  const enteredFromOAuth = useRef(false);
  const [oauthTimedOut, setOauthTimedOut] = useState(false);

  useEffect(() => {
    if (!supabase) return undefined;

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event) => {
      if (event === "SIGNED_IN" && readAuthLinkType() === "signup") {
        setVerifiedFromLink(true);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  // After Google returns, drop into the store once the session is ready (once only).
  useEffect(() => {
    if (loading || !user || !fromOAuth || enteredFromOAuth.current) return;
    enteredFromOAuth.current = true;
    goIntoApp(navigate, redirectTo, {
      needsName: user.needsName,
      flash: "Signed in successfully.",
    });
  }, [loading, user, fromOAuth, navigate, redirectTo]);

  useEffect(() => {
    if (!fromOAuth || user) return undefined;
    const timer = window.setTimeout(() => setOauthTimedOut(true), 8000);
    return () => window.clearTimeout(timer);
  }, [fromOAuth, user]);

  // Clean the URL once we have captured the verified flag.
  useEffect(() => {
    if (searchParams.get("verified") !== "1") return;
    const next = new URLSearchParams(searchParams);
    next.delete("verified");
    if (!next.get("mode")) next.set("mode", "login");
    setSearchParams(next, { replace: true });
  }, [searchParams, setSearchParams]);

  function switchMode(nextMode) {
    const params = new URLSearchParams(searchParams);
    params.set("mode", nextMode);
    params.delete("verified");
    navigate(`/auth?${params}`, { replace: true });
  }

  const brand = (
    <Stack
      direction="row"
      spacing={1}
      sx={{ alignItems: "center", justifyContent: "center", mb: 3, color: "primary.main" }}
    >
      <BrandMark sx={{ fontSize: 36 }} />
      <Typography variant="h3" component="span" sx={{ letterSpacing: "-0.02em" }}>
        ShopEZ
      </Typography>
    </Stack>
  );

  if (pendingEmail) {
    return (
      <Container maxWidth="xs" sx={{ py: { xs: 5, md: 8 } }}>
        {brand}
        <Paper variant="outlined" sx={{ p: 3 }}>
          <Typography variant="h3" gutterBottom>
            Check your email
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2.5 }}>
            We sent a link to <strong>{pendingEmail}</strong>.
          </Typography>
          <Button
            variant="contained"
            fullWidth
            onClick={() => {
              setPendingEmail(null);
              switchMode("login");
            }}
          >
            Back to sign in
          </Button>
        </Paper>
      </Container>
    );
  }

  // Confirmation link often establishes a session immediately.
  if (!loading && user && verifiedNotice && mode !== "update-password") {
    return (
      <Container maxWidth="xs" sx={{ py: { xs: 5, md: 8 } }}>
        {brand}
        <Paper variant="outlined" sx={{ p: 3 }}>
          <Alert severity="success" sx={{ mb: 2.5 }}>
            You&apos;re verified. Welcome to ShopEZ.
          </Alert>
          <Button
            variant="contained"
            size="large"
            fullWidth
            onClick={() =>
              goIntoApp(navigate, redirectTo, {
                needsName: user.needsName,
                flash: "You're verified. Welcome to ShopEZ.",
              })
            }
          >
            Continue shopping
          </Button>
        </Paper>
      </Container>
    );
  }

  return (
    <Container maxWidth="xs" sx={{ py: { xs: 5, md: 8 } }}>
      {brand}

      {!configured && (
        <Alert severity="warning" sx={{ mb: 2 }}>
          Add your Supabase keys to <code>.env</code>, then restart the dev server.
        </Alert>
      )}

      {!loading && fromOAuth && !user && oauthTimedOut ? (
        <Paper variant="outlined" sx={{ p: 3 }}>
          <Alert severity="warning" sx={{ mb: 2 }}>
            Google sign-in did not finish. Check the SETUP-AUTH.md steps, then try again.
          </Alert>
          <Button
            variant="contained"
            fullWidth
            onClick={() => navigate("/auth?mode=login", { replace: true })}
          >
            Back to sign in
          </Button>
        </Paper>
      ) : !loading && user && fromOAuth ? (
        <Paper variant="outlined" sx={{ p: 4, textAlign: "center" }}>
          <CircularProgress aria-label="Signing you in" />
        </Paper>
      ) : (
      <Paper variant="outlined" sx={{ overflow: "hidden" }}>
        {mode === "reset" || mode === "update-password" ? (
          <Box sx={{ px: 3, pt: 3 }}>
            <Typography variant="h3">
              {mode === "update-password" ? "New password" : "Reset password"}
            </Typography>
          </Box>
        ) : (
          <Tabs
            value={mode}
            onChange={(_, value) => switchMode(value)}
            variant="fullWidth"
            sx={{ borderBottom: 1, borderColor: "divider" }}
          >
            <Tab label="Create account" value="signup" />
            <Tab label="Sign in" value="login" />
          </Tabs>
        )}

        {mode === "reset" ? (
          <ResetRequestForm key="reset" redirectTo={redirectTo} />
        ) : mode === "update-password" ? (
          <UpdatePasswordForm key="update" redirectTo={redirectTo} />
        ) : (
          <CredentialsForm
            key={mode}
            isSignUp={mode === "signup"}
            redirectTo={redirectTo}
            verifiedNotice={verifiedNotice && mode === "login"}
            onNeedsConfirmation={setPendingEmail}
          />
        )}
      </Paper>
      )}
    </Container>
  );
}
