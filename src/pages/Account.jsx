import { useEffect, useMemo, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import Alert from "@mui/material/Alert";
import Avatar from "@mui/material/Avatar";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import CircularProgress from "@mui/material/CircularProgress";
import Container from "@mui/material/Container";
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogContentText from "@mui/material/DialogContentText";
import DialogTitle from "@mui/material/DialogTitle";
import Divider from "@mui/material/Divider";
import List from "@mui/material/List";
import ListItemButton from "@mui/material/ListItemButton";
import ListItemText from "@mui/material/ListItemText";
import Paper from "@mui/material/Paper";
import Stack from "@mui/material/Stack";
import TextField from "@mui/material/TextField";
import ToggleButton from "@mui/material/ToggleButton";
import ToggleButtonGroup from "@mui/material/ToggleButtonGroup";
import Typography from "@mui/material/Typography";
import DarkModeOutlinedIcon from "@mui/icons-material/DarkModeOutlined";
import EmailOutlinedIcon from "@mui/icons-material/EmailOutlined";
import LightModeOutlinedIcon from "@mui/icons-material/LightModeOutlined";
import SettingsBrightnessOutlinedIcon from "@mui/icons-material/SettingsBrightnessOutlined";
import GoogleGlyph from "../components/GoogleGlyph";
import { useAuth } from "../context/auth-context";
import { useCart } from "../context/cart-context";
import { useColorMode } from "../context/color-mode-context";
import { setFlash } from "../lib/flash";
import { formatOrderStatus, listOrders } from "../services/orders";
import { formatPrice } from "../config/store";
import { MONO } from "../theme";

const MIN_PASSWORD_LENGTH = 8;

const NAV = [
  { id: "profile", label: "Profile" },
  { id: "orders", label: "Orders" },
  { id: "security", label: "Security" },
  { id: "appearance", label: "Appearance" },
  { id: "danger", label: "Delete account" },
];

function shortOrderId(id) {
  if (!id) return "—";
  return String(id).replace(/-/g, "").slice(0, 8).toUpperCase();
}

function Panel({ title, description, children }) {
  return (
    <Box>
      <Typography variant="h2" component="h2">
        {title}
      </Typography>
      {description && (
        <Typography variant="body2" color="text.secondary" sx={{ mt: 0.75, mb: 3 }}>
          {description}
        </Typography>
      )}
      {!description && <Box sx={{ mb: 3 }} />}
      {children}
    </Box>
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
    <Box component="form" onSubmit={onSubmit} noValidate>
      <Stack spacing={2} sx={{ maxWidth: 420 }}>
        {forceSetup && (
          <Alert severity="info">Add your name so we can greet you instead of your email.</Alert>
        )}
        {status && <Alert severity={status.type}>{status.message}</Alert>}
        <TextField
          label="Your name"
          autoComplete="name"
          value={name}
          onChange={(event) => {
            setName(event.target.value);
            setStatus(null);
          }}
          helperText="Shown in the app instead of your full email"
        />
        <Box>
          <Button
            type="submit"
            variant="contained"
            disabled={busy || name.trim().length < 2}
            startIcon={busy ? <CircularProgress size={16} color="inherit" /> : null}
          >
            Save name
          </Button>
        </Box>
      </Stack>
    </Box>
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
    <Box component="form" onSubmit={onSubmit} noValidate>
      <Stack spacing={2} sx={{ maxWidth: 420 }}>
        {status && <Alert severity={status.type}>{status.message}</Alert>}
        <TextField
          label="Current password"
          type="password"
          autoComplete="current-password"
          value={fields.current}
          onChange={set("current")}
        />
        <TextField
          label="New password"
          type="password"
          autoComplete="new-password"
          value={fields.next}
          onChange={set("next")}
          helperText={`At least ${MIN_PASSWORD_LENGTH} characters`}
        />
        <TextField
          label="Confirm new password"
          type="password"
          autoComplete="new-password"
          value={fields.confirm}
          onChange={set("confirm")}
        />
        <Box>
          <Button
            type="submit"
            variant="contained"
            disabled={busy || !fields.current || !fields.next}
            startIcon={busy ? <CircularProgress size={16} color="inherit" /> : null}
          >
            Update password
          </Button>
        </Box>
      </Stack>
    </Box>
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
      icon: <GoogleGlyph sx={{ width: 18, height: 18 }} />,
    });
  }
  if (linkedEmail) {
    rows.push({
      id: "email",
      title: "Email",
      subtitle: user.email,
      icon: <EmailOutlinedIcon sx={{ fontSize: 20, color: "text.secondary" }} />,
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
    <Stack spacing={2}>
      {error && <Alert severity="error">{error}</Alert>}
      {notice && <Alert severity="success">{notice}</Alert>}

      {rows.length === 0 ? (
        <Typography variant="body2" color="text.secondary">
          No sign-in methods connected yet.
        </Typography>
      ) : (
        <Paper variant="outlined" sx={{ overflow: "hidden" }}>
          {rows.map((row, index) => (
            <Box key={row.id}>
              {index > 0 && <Divider />}
              <Stack
                direction="row"
                spacing={1.5}
                sx={{
                  alignItems: "center",
                  px: 2,
                  py: 1.75,
                  minHeight: 64,
                }}
              >
                <Box
                  sx={{
                    width: 40,
                    height: 40,
                    borderRadius: 1,
                    display: "grid",
                    placeItems: "center",
                    flexShrink: 0,
                    bgcolor: "action.hover",
                  }}
                >
                  {row.icon}
                </Box>

                <Box sx={{ minWidth: 0, flex: 1 }}>
                  <Typography sx={{ fontWeight: 600, lineHeight: 1.3 }}>{row.title}</Typography>
                  <Typography
                    variant="body2"
                    color="text.secondary"
                    noWrap
                    title={row.subtitle}
                  >
                    {row.subtitle}
                  </Typography>
                </Box>

                <Button
                  size="small"
                  color="inherit"
                  disabled={!canDisconnect || busy === row.id}
                  onClick={() => handleDisconnect(row.id)}
                  sx={{ flexShrink: 0 }}
                >
                  {busy === row.id ? <CircularProgress size={16} /> : "Disconnect"}
                </Button>
              </Stack>
            </Box>
          ))}
        </Paper>
      )}

      {!canDisconnect && rows.length > 0 && (
        <Typography variant="caption" color="text.secondary">
          Disconnect stays off while this is your only sign-in method.
        </Typography>
      )}

      {!linkedGoogle && (
        <Button
          variant="outlined"
          onClick={handleConnectGoogle}
          disabled={busy === "link-google"}
          startIcon={
            busy === "link-google" ? (
              <CircularProgress size={16} color="inherit" />
            ) : (
              <GoogleGlyph sx={{ width: 16, height: 16 }} />
            )
          }
          sx={{ alignSelf: "flex-start" }}
        >
          Connect Google
        </Button>
      )}
    </Stack>
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
      <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
        Permanently removes this account and signs you out. Your cart on this device is cleared.
      </Typography>
      <Button color="error" variant="outlined" onClick={() => setOpen(true)}>
        Delete account
      </Button>

      <Dialog open={open} onClose={busy ? undefined : close} maxWidth="xs" fullWidth>
        <DialogTitle>Delete this account?</DialogTitle>
        <DialogContent>
          <DialogContentText sx={{ mb: 2 }}>
            This cannot be undone. Type <strong>{CONFIRM_PHRASE}</strong> to confirm.
          </DialogContentText>
          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}
          <TextField
            label="Confirmation"
            placeholder={CONFIRM_PHRASE}
            value={phrase}
            onChange={(event) => {
              setPhrase(event.target.value);
              setError(null);
            }}
            autoFocus
            autoComplete="off"
          />
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={close} disabled={busy}>
            Cancel
          </Button>
          <Button
            color="error"
            variant="contained"
            onClick={confirmDelete}
            disabled={busy || !phraseMatches}
            startIcon={busy ? <CircularProgress size={16} color="inherit" /> : null}
          >
            Delete account
          </Button>
        </DialogActions>
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
    <Paper variant="outlined" sx={{ overflow: "hidden" }}>
      <Box
        sx={{
          px: { xs: 2, sm: 2.5 },
          py: 2,
          display: "flex",
          flexWrap: "wrap",
          gap: 1.5,
          justifyContent: "space-between",
          alignItems: "flex-start",
          bgcolor: "action.hover",
          borderBottom: 1,
          borderColor: "divider",
        }}
      >
        <Box>
          <Typography sx={{ fontWeight: 600 }}>Order #{shortOrderId(order.id)}</Typography>
          <Typography variant="body2" color="text.secondary">
            {new Date(order.createdAt).toLocaleString(undefined, {
              dateStyle: "medium",
              timeStyle: "short",
            })}
          </Typography>
        </Box>
        <Stack spacing={0.25} sx={{ alignItems: { xs: "flex-start", sm: "flex-end" } }}>
          <Typography sx={{ fontFamily: MONO, fontWeight: 600 }}>
            {formatPrice(order.total)}
          </Typography>
          <Typography variant="caption" color="text.secondary">
            {formatOrderStatus(order.status)}
            {paidWith ? ` · ${paidWith}` : ""}
          </Typography>
        </Stack>
      </Box>

      <Stack spacing={1} sx={{ px: { xs: 2, sm: 2.5 }, py: 2 }}>
        {order.items.map((item) => (
          <Stack
            key={item.id}
            direction="row"
            spacing={2}
            sx={{ justifyContent: "space-between", gap: 2 }}
          >
            <Typography variant="body2" color="text.secondary" sx={{ minWidth: 0 }}>
              {item.name}
              <Box component="span" sx={{ color: "text.disabled" }}>
                {" "}
                ×{item.quantity}
              </Box>
            </Typography>
            <Typography variant="body2" sx={{ flexShrink: 0, fontFamily: MONO }}>
              {formatPrice(item.lineTotal)}
            </Typography>
          </Stack>
        ))}
      </Stack>

      <Divider />

      <Stack
        direction="row"
        spacing={2}
        sx={{
          px: { xs: 2, sm: 2.5 },
          py: 1.75,
          justifyContent: "space-between",
        }}
      >
        <Typography variant="body2" color="text.secondary">
          Total
        </Typography>
        <Typography variant="h5" sx={{ fontFamily: MONO }}>
          {formatPrice(order.total)}
        </Typography>
      </Stack>
    </Paper>
  );
}

function OrdersPanel() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

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
      <Stack direction="row" spacing={1.5} sx={{ alignItems: "center", py: 2 }}>
        <CircularProgress size={18} />
        <Typography variant="body2" color="text.secondary">
          Loading orders…
        </Typography>
      </Stack>
    );
  }

  if (error) {
    return <Alert severity="error">{error}</Alert>;
  }

  if (successful.length === 0) {
    return (
      <Paper variant="outlined" sx={{ p: 3 }}>
        <Typography variant="body2" color="text.secondary">
          No completed orders yet. Paid checkouts will show up here as order summaries.
        </Typography>
      </Paper>
    );
  }

  return (
    <Stack spacing={2}>
      {successful.map((order) => (
        <OrderSummaryCard key={order.id} order={order} />
      ))}
    </Stack>
  );
}

export default function Account() {
  const { user, logout } = useAuth();
  const { itemCount } = useCart();
  const { preference, setPreference } = useColorMode();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
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
    <Container maxWidth="lg" sx={{ py: { xs: 3, md: 5 } }}>
      <Typography variant="h1" gutterBottom>
        Settings
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
        Manage your ShopEZ profile, orders, and sign-in.
      </Typography>

      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: { xs: "1fr", md: "220px minmax(0, 1fr)" },
          gap: { xs: 2, md: 4 },
          alignItems: "start",
        }}
      >
        <Paper
          variant="outlined"
          sx={{
            p: 0.5,
            position: { md: "sticky" },
            top: 88,
          }}
        >
          <List dense disablePadding>
            {NAV.map((item) => (
              <ListItemButton
                key={item.id}
                selected={active === item.id}
                onClick={() => setSection(item.id)}
                sx={{
                  borderRadius: 1,
                  mb: 0.25,
                  "&.Mui-selected": {
                    bgcolor: "action.selected",
                  },
                }}
              >
                <ListItemText
                  primary={item.label}
                  primaryTypographyProps={{
                    fontWeight: active === item.id ? 600 : 500,
                    color: item.id === "danger" ? "error.main" : "inherit",
                  }}
                />
              </ListItemButton>
            ))}
          </List>
        </Paper>

        <Paper variant="outlined" sx={{ p: { xs: 2.5, md: 3.5 }, minHeight: 360 }}>
          {active === "profile" && (
            <Panel title="Profile" description="How you appear in ShopEZ.">
              <Stack direction="row" spacing={2} sx={{ alignItems: "center", mb: 3 }}>
                <Avatar
                  src={user.avatarUrl || undefined}
                  sx={{ width: 56, height: 56, bgcolor: "primary.main" }}
                >
                  {initial}
                </Avatar>
                <Box sx={{ minWidth: 0 }}>
                  <Typography sx={{ fontWeight: 600, wordBreak: "break-word" }}>
                    {displayName}
                  </Typography>
                  <Typography variant="body2" color="text.secondary" noWrap title={user.email}>
                    {user.email}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    Joined {joined}
                    {itemCount > 0 ? ` · ${itemCount} in cart` : ""}
                  </Typography>
                </Box>
              </Stack>

              <Divider sx={{ mb: 3 }} />
              <ProfileNameForm forceSetup={forceSetup} />
              <Divider sx={{ my: 3 }} />
              <Button
                variant="outlined"
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
            <Panel
              title="Orders"
              description="Completed checkouts for this account."
            >
              <OrdersPanel />
            </Panel>
          )}

          {active === "security" && (
            <Panel title="Security" description="Sign-in methods and password.">
              <Typography variant="subtitle2" color="text.secondary" sx={{ mb: 1.5 }}>
                Linked accounts
              </Typography>
              <LinkedAccounts />
              {user.canChangePassword && (
                <>
                  <Divider sx={{ my: 3 }} />
                  <Typography variant="subtitle2" color="text.secondary" sx={{ mb: 1.5 }}>
                    Password
                  </Typography>
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
              <ToggleButtonGroup
                exclusive
                size="small"
                value={preference}
                onChange={(_, value) => value && setPreference(value)}
                aria-label="Theme preference"
              >
                <ToggleButton value="system">
                  <SettingsBrightnessOutlinedIcon fontSize="small" sx={{ mr: 1 }} />
                  System
                </ToggleButton>
                <ToggleButton value="light">
                  <LightModeOutlinedIcon fontSize="small" sx={{ mr: 1 }} />
                  Light
                </ToggleButton>
                <ToggleButton value="dark">
                  <DarkModeOutlinedIcon fontSize="small" sx={{ mr: 1 }} />
                  Dark
                </ToggleButton>
              </ToggleButtonGroup>
            </Panel>
          )}

          {active === "danger" && (
            <Panel title="Delete account" description="This action is permanent.">
              <DeleteAccount />
            </Panel>
          )}
        </Paper>
      </Box>
    </Container>
  );
}
