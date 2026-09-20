import { useEffect, useRef, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { Link as RouterLink, useNavigate, useSearchParams } from "react-router-dom";
import { Eye, EyeOff, Loader2 } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button, buttonVariants } from "@/components/ui/button";
import {
  Field,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";
import BrandMark from "../components/BrandMark";
import GoogleGlyph from "../components/GoogleGlyph";
import { useAuth } from "../context/AuthProvider";
import { markAppEnter } from "../hooks/useWarmReveal";
import { setFlash } from "../lib/flash";
import { clearGoogleOAuthAttempt, consumeGoogleOAuthAttempt } from "../lib/supabase";
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

function alertTone(severity) {
  if (severity === "success") {
    return "border-success/40 text-success *:data-[slot=alert-description]:text-success/90";
  }
  if (severity === "warning") {
    return "border-warning/40 text-warning *:data-[slot=alert-description]:text-warning/90";
  }
  return undefined;
}

function usePasswordVisibility() {
  const [visible, setVisible] = useState(false);

  const toggle = (
    <Button
      type="button"
      variant="ghost"
      size="icon-sm"
      className="absolute top-1/2 right-1 size-8 -translate-y-1/2"
      onClick={() => setVisible((current) => !current)}
      aria-label={visible ? "Hide password" : "Show password"}
    >
      {visible ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
    </Button>
  );

  return { type: visible ? "text" : "password", toggle };
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
    <form onSubmit={handleSubmit(onSubmit)} noValidate className="p-6">
      {verifiedNotice && (
        <Alert className={cn("mb-5", alertTone("success"))}>
          <AlertDescription>Email verified. Sign in to continue.</AlertDescription>
        </Alert>
      )}
      {formError && (
        <Alert className={cn("mb-5", alertTone("warning"))}>
          <AlertDescription>{formError}</AlertDescription>
        </Alert>
      )}

      <FieldGroup className="gap-4">
        <Button
          type="button"
          variant="outline"
          size="lg"
          className="h-10 w-full bg-card"
          onClick={onGoogle}
          disabled={googleBusy || isSubmitting}
        >
          {googleBusy ? (
            <Loader2 className="size-4 animate-spin" aria-hidden />
          ) : (
            <GoogleGlyph />
          )}
          Continue with Google
        </Button>

        <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-3">
          <div className="border-b border-border" />
          <span className="text-xs text-muted-foreground">or</span>
          <div className="border-b border-border" />
        </div>

        {isSignUp && (
          <Controller
            name="fullName"
            control={control}
            rules={nameRules}
            render={({ field, fieldState }) => {
              const descId = "fullName-desc";
              const errorId = "fullName-error";
              return (
                <Field data-invalid={fieldState.invalid || undefined}>
                  <FieldLabel htmlFor={field.name}>Your name</FieldLabel>
                  <Input
                    {...field}
                    id={field.name}
                    autoComplete="name"
                    aria-invalid={fieldState.invalid}
                    aria-describedby={fieldState.invalid ? errorId : descId}
                    className="h-10"
                  />
                  {fieldState.invalid ? (
                    <FieldError id={errorId} errors={[fieldState.error]} />
                  ) : (
                    <FieldDescription id={descId}>Shown on your account</FieldDescription>
                  )}
                </Field>
              );
            }}
          />
        )}

        <Controller
          name="email"
          control={control}
          rules={emailRules}
          render={({ field, fieldState }) => {
            const errorId = "email-error";
            return (
              <Field data-invalid={fieldState.invalid || undefined}>
                <FieldLabel htmlFor={field.name}>Email</FieldLabel>
                <Input
                  {...field}
                  id={field.name}
                  type="email"
                  autoComplete="email"
                  aria-invalid={fieldState.invalid}
                  aria-describedby={fieldState.invalid ? errorId : undefined}
                  className="h-10"
                />
                {fieldState.invalid && <FieldError id={errorId} errors={[fieldState.error]} />}
              </Field>
            );
          }}
        />

        <Controller
          name="password"
          control={control}
          rules={isSignUp ? newPasswordRules : { required: "Enter your password." }}
          render={({ field, fieldState }) => {
            const descId = "password-desc";
            const errorId = "password-error";
            return (
              <Field data-invalid={fieldState.invalid || undefined}>
                <FieldLabel htmlFor={field.name}>Password</FieldLabel>
                <div className="relative">
                  <Input
                    {...field}
                    id={field.name}
                    type={password.type}
                    autoComplete={isSignUp ? "new-password" : "current-password"}
                    aria-invalid={fieldState.invalid}
                    aria-describedby={fieldState.invalid ? errorId : isSignUp ? descId : undefined}
                    className="h-10 pr-10"
                  />
                  {password.toggle}
                </div>
                {fieldState.invalid ? (
                  <FieldError id={errorId} errors={[fieldState.error]} />
                ) : isSignUp ? (
                  <FieldDescription id={descId}>
                    At least {MIN_PASSWORD_LENGTH} characters
                  </FieldDescription>
                ) : null}
              </Field>
            );
          }}
        />

        {isSignUp && (
          <Controller
            name="confirmPassword"
            control={control}
            rules={{
              validate: (value) =>
                value === getValues("password") || "The two passwords do not match.",
            }}
            render={({ field, fieldState }) => {
              const errorId = "confirmPassword-error";
              return (
                <Field data-invalid={fieldState.invalid || undefined}>
                  <FieldLabel htmlFor={field.name}>Confirm password</FieldLabel>
                  <Input
                    {...field}
                    id={field.name}
                    type={password.type}
                    autoComplete="new-password"
                    aria-invalid={fieldState.invalid}
                    aria-describedby={fieldState.invalid ? errorId : undefined}
                    className="h-10"
                  />
                  {fieldState.invalid && <FieldError id={errorId} errors={[fieldState.error]} />}
                </Field>
              );
            }}
          />
        )}

        <Button type="submit" size="lg" className="h-10 w-full" disabled={isSubmitting || googleBusy}>
          {isSubmitting && <Loader2 className="size-4 animate-spin" aria-hidden />}
          {isSignUp ? "Create account" : "Sign in"}
        </Button>

        {!isSignUp && (
          <p className="text-center text-sm">
            <RouterLink
              to={`/auth?mode=reset${redirectTo ? `&redirect=${redirectTo}` : ""}`}
              className="text-primary underline-offset-4 hover:underline"
            >
              Forgot your password?
            </RouterLink>
          </p>
        )}
      </FieldGroup>
    </form>
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
      <div className="p-6">
        <Alert className={cn("mb-4", alertTone("success"))}>
          <AlertDescription>Check your email for a reset link.</AlertDescription>
        </Alert>
        <RouterLink
          to={`/auth?mode=login${redirectTo ? `&redirect=${redirectTo}` : ""}`}
          className={cn(buttonVariants({ size: "lg" }), "inline-flex h-10 w-full")}
        >
          Back to sign in
        </RouterLink>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate className="p-6">
      {formError && (
        <Alert variant="destructive" className="mb-5">
          <AlertDescription>{formError}</AlertDescription>
        </Alert>
      )}

      <FieldGroup className="gap-4">
        <Controller
          name="email"
          control={control}
          rules={emailRules}
          render={({ field, fieldState }) => {
            const errorId = "reset-email-error";
            return (
              <Field data-invalid={fieldState.invalid || undefined}>
                <FieldLabel htmlFor={field.name}>Email</FieldLabel>
                <Input
                  {...field}
                  id={field.name}
                  type="email"
                  autoComplete="email"
                  aria-invalid={fieldState.invalid}
                  aria-describedby={fieldState.invalid ? errorId : undefined}
                  className="h-10"
                />
                {fieldState.invalid && <FieldError id={errorId} errors={[fieldState.error]} />}
              </Field>
            );
          }}
        />

        <Button type="submit" size="lg" className="h-10 w-full" disabled={isSubmitting}>
          {isSubmitting && <Loader2 className="size-4 animate-spin" aria-hidden />}
          Send reset link
        </Button>

        <p className="text-center text-sm">
          <RouterLink
            to={`/auth?mode=login${redirectTo ? `&redirect=${redirectTo}` : ""}`}
            className="text-primary underline-offset-4 hover:underline"
          >
            Back to sign in
          </RouterLink>
        </p>
      </FieldGroup>
    </form>
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
      <div className="p-6">
        <Alert className={cn("mb-4", alertTone("warning"))}>
          <AlertDescription>Open the reset link from your email first.</AlertDescription>
        </Alert>
        <RouterLink
          to="/auth?mode=reset"
          className={cn(buttonVariants({ variant: "outline", size: "lg" }), "inline-flex h-10 w-full")}
        >
          Request a new link
        </RouterLink>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate className="p-6">
      {formError && (
        <Alert variant="destructive" className="mb-5">
          <AlertDescription>{formError}</AlertDescription>
        </Alert>
      )}

      <FieldGroup className="gap-4">
        <Controller
          name="password"
          control={control}
          rules={newPasswordRules}
          render={({ field, fieldState }) => {
            const descId = "new-password-desc";
            const errorId = "new-password-error";
            return (
              <Field data-invalid={fieldState.invalid || undefined}>
                <FieldLabel htmlFor={field.name}>New password</FieldLabel>
                <div className="relative">
                  <Input
                    {...field}
                    id={field.name}
                    type={password.type}
                    autoComplete="new-password"
                    aria-invalid={fieldState.invalid}
                    aria-describedby={fieldState.invalid ? errorId : descId}
                    className="h-10 pr-10"
                  />
                  {password.toggle}
                </div>
                {fieldState.invalid ? (
                  <FieldError id={errorId} errors={[fieldState.error]} />
                ) : (
                  <FieldDescription id={descId}>
                    At least {MIN_PASSWORD_LENGTH} characters
                  </FieldDescription>
                )}
              </Field>
            );
          }}
        />

        <Controller
          name="confirmPassword"
          control={control}
          rules={{
            validate: (value) =>
              value === getValues("password") || "The two passwords do not match.",
          }}
          render={({ field, fieldState }) => {
            const errorId = "confirm-new-password-error";
            return (
              <Field data-invalid={fieldState.invalid || undefined}>
                <FieldLabel htmlFor={field.name}>Confirm new password</FieldLabel>
                <Input
                  {...field}
                  id={field.name}
                  type={password.type}
                  autoComplete="new-password"
                  aria-invalid={fieldState.invalid}
                  aria-describedby={fieldState.invalid ? errorId : undefined}
                  className="h-10"
                />
                {fieldState.invalid && <FieldError id={errorId} errors={[fieldState.error]} />}
              </Field>
            );
          }}
        />

        <Button type="submit" size="lg" className="h-10 w-full" disabled={isSubmitting}>
          {isSubmitting && <Loader2 className="size-4 animate-spin" aria-hidden />}
          Save new password
        </Button>
      </FieldGroup>
    </form>
  );
}

function readAuthLinkType() {
  const hash = window.location.hash.startsWith("#")
    ? window.location.hash.slice(1)
    : window.location.hash;
  return new URLSearchParams(hash).get("type");
}

function AuthBrand() {
  return (
    <div className="mb-6 flex items-center justify-center gap-2 text-primary">
      <BrandMark className="size-9" />
      <span className="text-2xl font-semibold tracking-[-0.02em] sm:text-[1.75rem]">ShopEZ</span>
    </div>
  );
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

  const shell = "mx-auto w-full max-w-md px-4 py-10 sm:px-6 md:py-16";

  if (pendingEmail) {
    return (
      <div className={shell}>
        <AuthBrand />
        <div className="rounded-[var(--radius)] border border-border bg-card p-6">
          <h1 className="text-xl font-semibold tracking-tight sm:text-[1.375rem]">
            Check your email
          </h1>
          <p className="mt-2 mb-5 text-sm text-muted-foreground">
            We sent a link to <strong className="text-foreground">{pendingEmail}</strong>.
          </p>
          <Button
            className="h-10 w-full"
            onClick={() => {
              setPendingEmail(null);
              switchMode("login");
            }}
          >
            Back to sign in
          </Button>
        </div>
      </div>
    );
  }

  if (!loading && user && verifiedNotice && mode !== "update-password") {
    return (
      <div className={shell}>
        <AuthBrand />
        <div className="rounded-[var(--radius)] border border-border bg-card p-6">
          <Alert className={cn("mb-5", alertTone("success"))}>
            <AlertDescription>You&apos;re verified. Welcome to ShopEZ.</AlertDescription>
          </Alert>
          <Button
            size="lg"
            className="h-10 w-full"
            onClick={() =>
              goIntoApp(navigate, redirectTo, {
                needsName: user.needsName,
                flash: "You're verified. Welcome to ShopEZ.",
              })
            }
          >
            Continue shopping
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className={shell}>
      <AuthBrand />

      {!configured && (
        <Alert className={cn("mb-4", alertTone("warning"))}>
          <AlertDescription>
            Add your Supabase keys to <code className="font-mono">.env</code>, then restart the
            dev server.
          </AlertDescription>
        </Alert>
      )}

      {!loading && fromOAuth && !user && oauthTimedOut ? (
        <div className="rounded-[var(--radius)] border border-border bg-card p-6">
          <Alert className={cn("mb-4", alertTone("warning"))}>
            <AlertDescription>
              Google sign-in did not finish. Check the SETUP-AUTH.md steps, then try again.
            </AlertDescription>
          </Alert>
          <Button
            className="h-10 w-full"
            onClick={() => navigate("/auth?mode=login", { replace: true })}
          >
            Back to sign in
          </Button>
        </div>
      ) : !loading && user && fromOAuth ? (
        <div className="rounded-[var(--radius)] border border-border bg-card p-8 text-center">
          <Loader2 className="mx-auto size-8 animate-spin text-muted-foreground" aria-label="Signing you in" />
        </div>
      ) : (
        <div className="overflow-hidden rounded-[var(--radius)] border border-border bg-card">
          {mode === "reset" || mode === "update-password" ? (
            <div className="px-6 pt-6">
              <h1 className="text-xl font-semibold tracking-tight sm:text-[1.375rem]">
                {mode === "update-password" ? "New password" : "Reset password"}
              </h1>
            </div>
          ) : (
            <Tabs
              value={mode}
              onValueChange={(value) => switchMode(value)}
              className="w-full gap-0"
            >
              <TabsList
                variant="line"
                className="h-auto w-full rounded-none border-b border-border p-0"
              >
                <TabsTrigger value="signup" className="flex-1 rounded-none py-3">
                  Create account
                </TabsTrigger>
                <TabsTrigger value="login" className="flex-1 rounded-none py-3">
                  Sign in
                </TabsTrigger>
              </TabsList>
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
        </div>
      )}
    </div>
  );
}
