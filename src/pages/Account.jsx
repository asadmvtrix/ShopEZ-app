import { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import {
  Loader2,
  Mail,
  Moon,
  Sun,
  Monitor,
} from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Field, FieldDescription, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";
import GoogleGlyph from "../components/GoogleGlyph";
import PageContainer from "../components/PageContainer";
import { useAuth } from "../context/AuthProvider";
import { useCart } from "../context/CartProvider";
import { useColorMode } from "../context/ColorModeProvider";
import { setFlash } from "../lib/flash";
import { formatOrderStatus, listOrders } from "../services/orders";
import { formatPrice } from "../config/store";

const MIN_PASSWORD_LENGTH = 8;

const NAV = [
  { id: "profile", label: "Profile" },
  { id: "orders", label: "Orders" },
  { id: "security", label: "Security" },
  { id: "appearance", label: "Appearance" },
  { id: "danger", label: "Delete account" },
];

function alertTone(severity) {
  if (severity === "success") {
    return "border-success/40 text-success *:data-[slot=alert-description]:text-success/90";
  }
  if (severity === "warning") {
    return "border-warning/40 text-warning *:data-[slot=alert-description]:text-warning/90";
  }
  if (severity === "info") {
    return "border-primary/30";
  }
  return undefined;
}

function shortOrderId(id) {
  if (!id) return "—";
  return String(id).replace(/-/g, "").slice(0, 8).toUpperCase();
}

function Panel({ title, description, children }) {
  return (
    <div>
      <h2 className="text-xl font-semibold tracking-tight sm:text-[1.375rem]">{title}</h2>
      {description ? (
        <p className="mt-1.5 mb-6 text-sm text-muted-foreground">{description}</p>
      ) : (
        <div className="mb-6" />
      )}
      {children}
    </div>
  );
}

function ProfileNameForm({ forceSetup }) {
  const { user, updateProfile } = useAuth();
  const [name, setName] = useState(user.name ?? "");
  const [status, setStatus] = useState(null);
  const [busy, setBusy] = useState(false);

  async function onSubmit(event) {
    event.preventDefault();
    setBusy(true);
    const result = await updateProfile({ fullName: name });
    setBusy(false);

    if (!result.success) {
      setStatus({ type: "error", message: result.error });
      return;
    }
    setStatus({ type: "success", message: "Name saved." });
  }

  return (
    <form onSubmit={onSubmit} noValidate>
      <div className="flex max-w-md flex-col gap-4">
        {forceSetup && (
          <Alert className={alertTone("info")}>
            <AlertDescription>
              Add your name so we can greet you instead of your email.
            </AlertDescription>
          </Alert>
        )}
        {status && (
          <Alert
            variant={status.type === "error" ? "destructive" : "default"}
            className={status.type === "success" ? alertTone("success") : undefined}
          >
            <AlertDescription>{status.message}</AlertDescription>
          </Alert>
        )}
        <Field>
          <FieldLabel htmlFor="profile-name">Your name</FieldLabel>
          <Input
            id="profile-name"
            autoComplete="name"
            value={name}
            onChange={(event) => {
              setName(event.target.value);
              setStatus(null);
            }}
            aria-describedby="profile-name-desc"
            className="h-10"
          />
          <FieldDescription id="profile-name-desc">
            Shown in the app instead of your full email
          </FieldDescription>
        </Field>
        <div>
          <Button type="submit" disabled={busy || name.trim().length < 2}>
            {busy && <Loader2 className="size-4 animate-spin" aria-hidden />}
            Save name
          </Button>
        </div>
      </div>
    </form>
  );
}

function PasswordForm() {
  const { changePassword } = useAuth();
  const [fields, setFields] = useState({ current: "", next: "", confirm: "" });
  const [status, setStatus] = useState(null);
  const [busy, setBusy] = useState(false);

  const set = (key) => (event) => {
    setFields((current) => ({ ...current, [key]: event.target.value }));
    setStatus(null);
  };

  async function onSubmit(event) {
    event.preventDefault();

    if (fields.next.length < MIN_PASSWORD_LENGTH) {
      setStatus({ type: "error", message: `Use at least ${MIN_PASSWORD_LENGTH} characters.` });
      return;
    }
    if (fields.next !== fields.confirm) {
      setStatus({ type: "error", message: "The two new passwords do not match." });
      return;
    }
    if (fields.next === fields.current) {
      setStatus({ type: "error", message: "The new password matches the current one." });
      return;
    }

    setBusy(true);
    const result = await changePassword(fields.current, fields.next);
    setBusy(false);

    if (!result.success) {
      setStatus({ type: "error", message: result.error });
      return;
    }
    setFields({ current: "", next: "", confirm: "" });
    setStatus({ type: "success", message: "Password updated." });
  }

  return (
    <form onSubmit={onSubmit} noValidate>
      <div className="flex max-w-md flex-col gap-4">
        {status && (
          <Alert
            variant={status.type === "error" ? "destructive" : "default"}
            className={status.type === "success" ? alertTone("success") : undefined}
          >
            <AlertDescription>{status.message}</AlertDescription>
          </Alert>
        )}
        <Field>
          <FieldLabel htmlFor="current-password">Current password</FieldLabel>
          <Input
            id="current-password"
            type="password"
            autoComplete="current-password"
            value={fields.current}
            onChange={set("current")}
            className="h-10"
          />
        </Field>
        <Field>
          <FieldLabel htmlFor="new-password">New password</FieldLabel>
          <Input
            id="new-password"
            type="password"
            autoComplete="new-password"
            value={fields.next}
            onChange={set("next")}
            aria-describedby="new-password-desc"
            className="h-10"
          />
          <FieldDescription id="new-password-desc">
            At least {MIN_PASSWORD_LENGTH} characters
          </FieldDescription>
        </Field>
        <Field>
          <FieldLabel htmlFor="confirm-password">Confirm new password</FieldLabel>
          <Input
            id="confirm-password"
            type="password"
            autoComplete="new-password"
            value={fields.confirm}
            onChange={set("confirm")}
            className="h-10"
          />
        </Field>
        <div>
          <Button type="submit" disabled={busy || !fields.current || !fields.next}>
            {busy && <Loader2 className="size-4 animate-spin" aria-hidden />}
            Update password
          </Button>
        </div>
      </div>
    </form>
  );
}

function LinkedAccounts() {
  const { user, linkGoogle, unlinkProvider } = useAuth();
  const [busy, setBusy] = useState(null);
  const [error, setError] = useState(null);
  const [notice, setNotice] = useState(null);

  const linkedGoogle = user.providers?.includes("google");
  const linkedEmail = user.providers?.includes("email");
  const canDisconnect = (user.providers?.length ?? 0) > 1;

  const rows = [];
  if (linkedGoogle) {
    rows.push({
      id: "google",
      title: "Google",
      subtitle: user.email,
      icon: <GoogleGlyph className="size-[18px]" />,
    });
  }
  if (linkedEmail) {
    rows.push({
      id: "email",
      title: "Email",
      subtitle: user.email,
      icon: <Mail className="size-5 text-muted-foreground" aria-hidden />,
    });
  }

  async function handleDisconnect(provider) {
    setError(null);
    setNotice(null);
    setBusy(provider);
    const result = await unlinkProvider(provider);
    setBusy(null);
    if (!result.success) {
      setError(result.error);
      return;
    }
    setNotice(`${provider === "google" ? "Google" : "Email"} disconnected.`);
  }

  async function handleConnectGoogle() {
    setError(null);
    setNotice(null);
    setBusy("link-google");
    const result = await linkGoogle();
    setBusy(null);
    if (!result.success) setError(result.error);
  }

  return (
    <div className="flex flex-col gap-4">
      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}
      {notice && (
        <Alert className={alertTone("success")}>
          <AlertDescription>{notice}</AlertDescription>
        </Alert>
      )}

      {rows.length === 0 ? (
        <p className="text-sm text-muted-foreground">No sign-in methods connected yet.</p>
      ) : (
        <div className="overflow-hidden rounded-[var(--radius)] border border-border bg-card">
          {rows.map((row, index) => (
            <div key={row.id}>
              {index > 0 && <Separator />}
              <div className="flex min-h-16 items-center gap-3 px-4 py-3.5">
                <div className="grid size-10 shrink-0 place-items-center rounded-[var(--radius)] bg-muted">
                  {row.icon}
                </div>

                <div className="min-w-0 flex-1">
                  <p className="font-semibold leading-snug">{row.title}</p>
                  <p className="truncate text-sm text-muted-foreground" title={row.subtitle}>
                    {row.subtitle}
                  </p>
                </div>

                <Button
                  size="sm"
                  variant="ghost"
                  disabled={!canDisconnect || busy === row.id}
                  onClick={() => handleDisconnect(row.id)}
                  className="shrink-0"
                >
                  {busy === row.id ? (
                    <Loader2 className="size-4 animate-spin" aria-hidden />
                  ) : (
                    "Disconnect"
                  )}
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}

      {!canDisconnect && rows.length > 0 && (
        <p className="text-xs text-muted-foreground">
          Disconnect stays off while this is your only sign-in method.
        </p>
      )}

      {!linkedGoogle && (
        <Button
          variant="outline"
          onClick={handleConnectGoogle}
          disabled={busy === "link-google"}
          className="self-start"
        >
          {busy === "link-google" ? (
            <Loader2 className="size-4 animate-spin" aria-hidden />
          ) : (
            <GoogleGlyph className="size-4" />
          )}
          Connect Google
        </Button>
      )}
    </div>
  );
}

function DeleteAccount() {
  const { deleteAccount } = useAuth();
  const { clearCart } = useCart();
  const navigate = useNavigate();

  const CONFIRM_PHRASE = "Delete My Account";
  const [open, setOpen] = useState(false);
  const [phrase, setPhrase] = useState("");
  const [error, setError] = useState(null);
  const [busy, setBusy] = useState(false);
  const phraseMatches = phrase.trim() === CONFIRM_PHRASE;

  function close() {
    setOpen(false);
    setPhrase("");
    setError(null);
  }

  async function confirmDelete() {
    if (!phraseMatches) return;
    setBusy(true);
    const result = await deleteAccount();
    setBusy(false);

    if (!result.success) {
      setError(result.error);
      return;
    }
    clearCart();
    navigate("/", { replace: true });
  }

  return (
    <>
      <p className="mb-4 text-sm text-muted-foreground">
        Permanently removes this account and signs you out. Your cart on this device is cleared.
      </p>
      <Button variant="destructive" onClick={() => setOpen(true)}>
        Delete account
      </Button>

      <Dialog
        open={open}
        onOpenChange={(next) => {
          if (!next && busy) return;
          if (!next) close();
          else setOpen(true);
        }}
      >
        <DialogContent showCloseButton={!busy} className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle>Delete this account?</DialogTitle>
            <DialogDescription>
              This cannot be undone. Type <strong>{CONFIRM_PHRASE}</strong> to confirm.
            </DialogDescription>
          </DialogHeader>

          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <Field>
            <FieldLabel htmlFor="delete-confirm">Confirmation</FieldLabel>
            <Input
              id="delete-confirm"
              placeholder={CONFIRM_PHRASE}
              value={phrase}
              onChange={(event) => {
                setPhrase(event.target.value);
                setError(null);
              }}
              autoFocus
              autoComplete="off"
              className="h-10"
            />
          </Field>

          <DialogFooter className="gap-2 sm:gap-2">
            <Button variant="outline" onClick={close} disabled={busy}>
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={confirmDelete}
              disabled={busy || !phraseMatches}
            >
              {busy && <Loader2 className="size-4 animate-spin" aria-hidden />}
              Delete account
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}

function OrderSummaryCard({ order }) {
  const paidWith =
    order.brand && order.last4
      ? `${String(order.brand)
          .toLowerCase()
          .replace(/\b\w/g, (c) => c.toUpperCase())} ·••${order.last4}`
      : null;

  return (
    <div className="overflow-hidden rounded-[var(--radius)] border border-border bg-card">
      <div className="flex flex-wrap items-start justify-between gap-3 border-b border-border bg-muted px-4 py-4 sm:px-5">
        <div>
          <p className="font-semibold">Order #{shortOrderId(order.id)}</p>
          <p className="text-sm text-muted-foreground">
            {new Date(order.createdAt).toLocaleString(undefined, {
              dateStyle: "medium",
              timeStyle: "short",
            })}
          </p>
        </div>
        <div className="flex flex-col items-start gap-0.5 sm:items-end">
          <p className="font-mono font-semibold">{formatPrice(order.total)}</p>
          <p className="text-xs text-muted-foreground">
            {formatOrderStatus(order.status)}
            {paidWith ? ` · ${paidWith}` : ""}
          </p>
        </div>
      </div>

      <div className="flex flex-col gap-2 px-4 py-4 sm:px-5">
        {order.items.map((item) => (
          <div key={item.id} className="flex justify-between gap-4">
            <p className="min-w-0 text-sm text-muted-foreground">
              {item.name}
              <span className="text-muted-foreground/60"> ×{item.quantity}</span>
            </p>
            <p className="shrink-0 font-mono text-sm">{formatPrice(item.lineTotal)}</p>
          </div>
        ))}
      </div>

      <Separator />

      <div className="flex justify-between gap-4 px-4 py-3.5 sm:px-5">
        <p className="text-sm text-muted-foreground">Total</p>
        <p className="font-mono text-base font-semibold">{formatPrice(order.total)}</p>
      </div>
    </div>
  );
}

function OrdersPanel() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const loadOrders = useCallback(() => {
    setLoading(true);
    setError(null);
    return listOrders().then((result) => {
      if (!result.success) {
        setError(result.error);
        setOrders([]);
      } else {
        setError(null);
        setOrders(result.orders);
      }
      setLoading(false);
    });
  }, []);

  useEffect(() => {
    let active = true;

    listOrders().then((result) => {
      if (!active) return;
      if (!result.success) {
        setError(result.error);
        setOrders([]);
      } else {
        setError(null);
        setOrders(result.orders);
      }
      setLoading(false);
    });

    return () => {
      active = false;
    };
  }, []);

  const successful = useMemo(
    () => orders.filter((order) => order.status === "paid" || order.status === "paid_sandbox"),
    [orders]
  );

  if (loading) {
    return (
      <div className="flex items-center gap-3 py-4">
        <Loader2 className="size-4 animate-spin text-muted-foreground" aria-hidden />
        <p className="text-sm text-muted-foreground">Loading orders…</p>
      </div>
    );
  }

  if (error) {
    return (
      <Alert variant="destructive">
        <AlertDescription className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <span>{error}</span>
          <Button variant="outline" size="sm" onClick={() => void loadOrders()}>
            Try again
          </Button>
        </AlertDescription>
      </Alert>
    );
  }

  if (successful.length === 0) {
    return (
      <div className="rounded-[var(--radius)] border border-border bg-card p-6">
        <p className="text-sm text-muted-foreground">
          No completed orders yet. Paid checkouts will show up here as order summaries.
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      {successful.map((order) => (
        <OrderSummaryCard key={order.id} order={order} />
      ))}
    </div>
  );
}

export default function Account() {
  const { user, logout } = useAuth();
  const { itemCount } = useCart();
  const { preference, setPreference } = useColorMode();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

  if (!user) return null;

  const forceSetup = searchParams.get("setup") === "1" || user.needsName;

  const sectionParam = searchParams.get("section");
  const active =
    NAV.some((item) => item.id === sectionParam) ? sectionParam : forceSetup ? "profile" : "profile";

  function setSection(id) {
    const next = new URLSearchParams(searchParams);
    next.set("section", id);
    if (id !== "profile") next.delete("setup");
    setSearchParams(next, { replace: true });
  }

  const displayName = user.name || "Your account";
  const initial = (user.name || user.email || "?").charAt(0).toUpperCase();

  const joined = user.createdAt
    ? new Date(user.createdAt).toLocaleDateString(undefined, {
        year: "numeric",
        month: "long",
        day: "numeric",
      })
    : "Not recorded";

  return (
    <PageContainer className="py-6 md:py-10">
      <h1 className="text-3xl font-semibold tracking-tight md:text-4xl">Settings</h1>
      <p className="mb-6 text-sm text-muted-foreground">
        Manage your ShopEZ profile, orders, and sign-in.
      </p>

      <div className="grid grid-cols-1 items-start gap-4 md:grid-cols-[220px_minmax(0,1fr)] md:gap-8">
        <nav
          aria-label="Account sections"
          className="rounded-[var(--radius)] border border-border bg-card p-1 md:sticky md:top-[88px]"
        >
          <ul className="flex flex-col gap-0.5">
            {NAV.map((item) => {
              const selected = active === item.id;
              return (
                <li key={item.id}>
                  <button
                    type="button"
                    onClick={() => setSection(item.id)}
                    aria-current={selected ? "page" : undefined}
                    className={cn(
                      "flex w-full min-h-10 items-center rounded-[var(--radius)] px-3 py-2 text-left text-sm transition-colors",
                      "focus-visible:outline-2 focus-visible:outline-offset-[-2px] focus-visible:outline-ring",
                      selected
                        ? "bg-muted font-semibold text-foreground"
                        : "font-medium text-foreground hover:bg-muted/60",
                      item.id === "danger" && "text-destructive"
                    )}
                  >
                    {item.label}
                  </button>
                </li>
              );
            })}
          </ul>
        </nav>

        <div className="min-h-[360px] rounded-[var(--radius)] border border-border bg-card p-5 md:p-7">
          {active === "profile" && (
            <Panel title="Profile" description="How you appear in ShopEZ.">
              <div className="mb-6 flex items-center gap-4">
                {user.avatarUrl ? (
                  <img
                    src={user.avatarUrl}
                    alt=""
                    className="size-14 rounded-full object-cover"
                  />
                ) : (
                  <div
                    className="grid size-14 place-items-center rounded-full bg-primary text-lg font-semibold text-primary-foreground"
                    aria-hidden
                  >
                    {initial}
                  </div>
                )}
                <div className="min-w-0">
                  <p className="font-semibold break-words">{displayName}</p>
                  <p className="truncate text-sm text-muted-foreground" title={user.email}>
                    {user.email}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Joined {joined}
                    {itemCount > 0 ? ` · ${itemCount} in cart` : ""}
                  </p>
                </div>
              </div>

              <Separator className="mb-6" />
              <ProfileNameForm forceSetup={forceSetup} />
              <Separator className="my-6" />
              <Button
                variant="outline"
                onClick={async () => {
                  await logout();
                  setFlash("Signed out successfully.");
                  navigate("/");
                }}
              >
                Sign out
              </Button>
            </Panel>
          )}

          {active === "orders" && (
            <Panel title="Orders" description="Completed checkouts for this account.">
              <OrdersPanel />
            </Panel>
          )}

          {active === "security" && (
            <Panel title="Security" description="Sign-in methods and password.">
              <p className="mb-3 text-sm font-medium text-muted-foreground">Linked accounts</p>
              <LinkedAccounts />
              {user.canChangePassword && (
                <>
                  <Separator className="my-6" />
                  <p className="mb-3 text-sm font-medium text-muted-foreground">Password</p>
                  <PasswordForm />
                </>
              )}
            </Panel>
          )}

          {active === "appearance" && (
            <Panel
              title="Appearance"
              description="Follow the system theme, or lock light/dark for this browser."
            >
              <div
                role="group"
                aria-label="Theme preference"
                className="inline-flex overflow-hidden rounded-[var(--radius)] border border-border"
              >
                {[
                  { value: "system", label: "System", icon: <Monitor className="size-4" aria-hidden /> },
                  { value: "light", label: "Light", icon: <Sun className="size-4" aria-hidden /> },
                  { value: "dark", label: "Dark", icon: <Moon className="size-4" aria-hidden /> },
                ].map(({ value, label, icon }) => (
                  <button
                    key={value}
                    type="button"
                    aria-pressed={preference === value}
                    onClick={() => setPreference(value)}
                    className={cn(
                      "inline-flex min-h-10 items-center gap-2 px-3 text-sm font-medium transition-colors",
                      "focus-visible:z-10 focus-visible:outline-2 focus-visible:outline-offset-[-2px] focus-visible:outline-ring",
                      preference === value
                        ? "bg-primary text-primary-foreground"
                        : "bg-card text-foreground hover:bg-muted"
                    )}
                  >
                    {icon}
                    {label}
                  </button>
                ))}
              </div>
            </Panel>
          )}

          {active === "danger" && (
            <Panel title="Delete account" description="This action is permanent.">
              <DeleteAccount />
            </Panel>
          )}
        </div>
      </div>
    </PageContainer>
  );
}
