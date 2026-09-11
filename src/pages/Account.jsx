import { useState } from "react";
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
import { MONO } from "../theme";

const MIN_PASSWORD_LENGTH = 8;

function Section({ title, description, children }) {
  return (
    <Paper variant="outlined" sx={{ p: { xs: 2.5, md: 3 } }}>
      <Typography variant="h3">{title}</Typography>
      {description && (
        <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
          {description}
        </Typography>
      )}
      <Box sx={{ mt: 2.5 }}>{children}</Box>
    </Paper>
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
        <Box>
          {rows.map((row, index) => (
            <Box key={row.id}>
              {index > 0 && <Divider />}
              <Stack
                direction="row"
                spacing={1.5}
                sx={{
                  alignItems: "center",
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
                  sx={{ flexShrink: 0, textTransform: "none", fontWeight: 600 }}
                >
                  {busy === row.id ? <CircularProgress size={16} /> : "Disconnect"}
                </Button>
              </Stack>
            </Box>
          ))}
        </Box>
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
          sx={{ alignSelf: "flex-start", textTransform: "none", fontWeight: 600 }}
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

export default function Account() {
  const { user, logout } = useAuth();
  const { itemCount } = useCart();
  const { preference, setPreference } = useColorMode();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const forceSetup = searchParams.get("setup") === "1" || user.needsName;

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
    <Container maxWidth="md" sx={{ py: { xs: 3, md: 5 } }}>
      <Typography variant="h1" gutterBottom>
        Account
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
        Profile and sign-in settings for ShopEZ.
      </Typography>

      <Stack spacing={3}>
        <Section title="Profile">
          <Stack direction="row" spacing={2} sx={{ alignItems: "center" }}>
            <Avatar
              src={user.avatarUrl || undefined}
              sx={{ width: 52, height: 52, bgcolor: "primary.main" }}
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
              </Typography>
            </Box>
          </Stack>

          <Divider sx={{ my: 2.5 }} />

          <ProfileNameForm forceSetup={forceSetup} />

          <Divider sx={{ my: 2.5 }} />

          <Stack
            direction="row"
            spacing={2}
            useFlexGap
            sx={{ flexWrap: "wrap", justifyContent: "space-between" }}
          >
            <Box>
              <Typography variant="body2" color="text.secondary">
                Items in cart
              </Typography>
              <Typography variant="h4" sx={{ fontFamily: MONO }}>
                {itemCount}
              </Typography>
            </Box>
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
          </Stack>
        </Section>

        <Section
          title="Linked accounts"
          description="Manage how you sign in to ShopEZ"
        >
          <LinkedAccounts />
        </Section>

        <Section
          title="Appearance"
          description="Follow the operating system, or pin the theme for this browser."
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
        </Section>

        {user.canChangePassword && (
          <Section title="Password" description="Used to sign in with email on any device.">
            <PasswordForm />
          </Section>
        )}

        <Paper variant="outlined" sx={{ p: { xs: 2.5, md: 3 }, borderColor: "error.main" }}>
          <Typography variant="h3" color="error.main">
            Delete account
          </Typography>
          <Box sx={{ mt: 2 }}>
            <DeleteAccount />
          </Box>
        </Paper>
      </Stack>
    </Container>
  );
}
