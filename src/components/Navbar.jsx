import { useState } from "react";
import { Link as RouterLink, useNavigate } from "react-router-dom";
import AppBar from "@mui/material/AppBar";
import Avatar from "@mui/material/Avatar";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Container from "@mui/material/Container";
import Divider from "@mui/material/Divider";
import Drawer from "@mui/material/Drawer";
import IconButton from "@mui/material/IconButton";
import List from "@mui/material/List";
import ListItemButton from "@mui/material/ListItemButton";
import ListItemText from "@mui/material/ListItemText";
import ListSubheader from "@mui/material/ListSubheader";
import Menu from "@mui/material/Menu";
import MenuItem from "@mui/material/MenuItem";
import Stack from "@mui/material/Stack";
import Toolbar from "@mui/material/Toolbar";
import Tooltip from "@mui/material/Tooltip";
import Typography from "@mui/material/Typography";
import CloseIcon from "@mui/icons-material/Close";
import DarkModeOutlinedIcon from "@mui/icons-material/DarkModeOutlined";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import LightModeOutlinedIcon from "@mui/icons-material/LightModeOutlined";
import MenuIcon from "@mui/icons-material/Menu";
import PersonOutlinedIcon from "@mui/icons-material/PersonOutlined";
import ShoppingCartOutlinedIcon from "@mui/icons-material/ShoppingCartOutlined";
import BrandMark from "./BrandMark";
import CartBadge from "./CartBadge";
import { useAuth } from "../context/auth-context";
import { useCart } from "../context/cart-context";
import { useColorMode } from "../context/color-mode-context";
import { getCategories } from "../data/products";

const categories = getCategories();

function categoryPath(category) {
  return `/browse?category=${encodeURIComponent(category)}`;
}

export default function Navbar() {
  const { user, logout } = useAuth();
  const { itemCount } = useCart();
  const { mode, toggleMode } = useColorMode();
  const navigate = useNavigate();

  const [drawerOpen, setDrawerOpen] = useState(false);
  const [categoryAnchor, setCategoryAnchor] = useState(null);
  const [accountAnchor, setAccountAnchor] = useState(null);

  const closeDrawer = () => setDrawerOpen(false);

  function handleLogout() {
    void logout().then(() => {
      setAccountAnchor(null);
      closeDrawer();
      navigate("/");
    });
  }

  return (
    <AppBar position="sticky">
      <Container maxWidth="lg" disableGutters>
        {/* Icon buttons shrink on phones so the full set still fits a 320px screen. */}
        <Toolbar
          sx={{
            gap: { xs: 0.25, sm: 1 },
            px: { xs: 1, sm: 3 },
            "& .MuiIconButton-root": { p: { xs: 0.75, sm: 1 } },
            "& .MuiIconButton-root .MuiSvgIcon-root": { fontSize: { xs: 20, sm: 24 } },
          }}
        >
          <IconButton
            edge="start"
            onClick={() => setDrawerOpen(true)}
            aria-label="Open navigation menu"
            sx={{ display: { md: "none" } }}
          >
            <MenuIcon />
          </IconButton>

          <Box
            component={RouterLink}
            to="/"
            sx={{
              display: "flex",
              alignItems: "center",
              gap: 1,
              color: "primary.main",
              textDecoration: "none",
              mr: { xs: 0.5, md: 2 },
            }}
          >
            <BrandMark sx={{ fontSize: { xs: 26, sm: 30 } }} />
            <Typography variant="h5" component="span" sx={{ letterSpacing: "-0.02em" }}>
              ShopEZ
            </Typography>
          </Box>

          <Stack direction="row" spacing={0.5} sx={{ display: { xs: "none", md: "flex" } }}>
            <Button component={RouterLink} to="/" color="inherit">
              Home
            </Button>
            <Button
              color="inherit"
              endIcon={<ExpandMoreIcon />}
              onClick={(event) => setCategoryAnchor(event.currentTarget)}
            >
              Categories
            </Button>
            <Button component={RouterLink} to="/browse" color="inherit">
              All products
            </Button>
          </Stack>

          <Menu
            anchorEl={categoryAnchor}
            open={Boolean(categoryAnchor)}
            onClose={() => setCategoryAnchor(null)}
          >
            {categories.map((category) => (
              <MenuItem
                key={category}
                component={RouterLink}
                to={categoryPath(category)}
                onClick={() => setCategoryAnchor(null)}
              >
                {category}
              </MenuItem>
            ))}
          </Menu>

          <Box sx={{ flexGrow: 1 }} />

          <Tooltip title={mode === "dark" ? "Switch to light theme" : "Switch to dark theme"}>
            <IconButton onClick={toggleMode} aria-label="Toggle colour theme">
              {mode === "dark" ? <LightModeOutlinedIcon /> : <DarkModeOutlinedIcon />}
            </IconButton>
          </Tooltip>

          <Tooltip title="Cart">
            <IconButton
              component={RouterLink}
              to="/cart"
              aria-label={`Cart, ${itemCount} ${itemCount === 1 ? "item" : "items"}`}
            >
              <CartBadge count={itemCount}>
                <ShoppingCartOutlinedIcon />
              </CartBadge>
            </IconButton>
          </Tooltip>

          {user ? (
            <>
              <Tooltip title={user.name || user.email}>
                <IconButton
                  onClick={(event) => setAccountAnchor(event.currentTarget)}
                  aria-label="Account menu"
                  sx={{ ml: 0.5 }}
                >
                  <Avatar
                    src={user.avatarUrl || undefined}
                    sx={{
                      width: { xs: 26, sm: 30 },
                      height: { xs: 26, sm: 30 },
                      bgcolor: "primary.main",
                      fontSize: 14,
                    }}
                  >
                    {(user.name || user.email || "?").charAt(0).toUpperCase()}
                  </Avatar>
                </IconButton>
              </Tooltip>
              <Menu
                anchorEl={accountAnchor}
                open={Boolean(accountAnchor)}
                onClose={() => setAccountAnchor(null)}
              >
                <MenuItem disabled sx={{ opacity: "1 !important", flexDirection: "column", alignItems: "flex-start" }}>
                  <Typography variant="body2" sx={{ fontWeight: 600 }}>
                    {user.name || "Your account"}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    {user.email}
                  </Typography>
                </MenuItem>
                <Divider />
                <MenuItem
                  component={RouterLink}
                  to="/account"
                  onClick={() => setAccountAnchor(null)}
                >
                  Account settings
                </MenuItem>
                <MenuItem onClick={handleLogout}>Sign out</MenuItem>
              </Menu>
            </>
          ) : (
            <>
              {/* The two buttons do not fit a phone toolbar, but signed-out visitors
                  still need a visible way in without opening the drawer. */}
              <Tooltip title="Sign in">
                <IconButton
                  component={RouterLink}
                  to="/auth?mode=login"
                  aria-label="Sign in"
                  sx={{ display: { xs: "inline-flex", sm: "none" } }}
                >
                  <PersonOutlinedIcon />
                </IconButton>
              </Tooltip>
              <Stack direction="row" spacing={1} sx={{ display: { xs: "none", sm: "flex" }, ml: 1 }}>
                <Button component={RouterLink} to="/auth?mode=login" color="inherit">
                  Sign in
                </Button>
                <Button component={RouterLink} to="/auth?mode=signup" variant="contained">
                  Create account
                </Button>
              </Stack>
            </>
          )}
        </Toolbar>
      </Container>

      <Drawer open={drawerOpen} onClose={closeDrawer} sx={{ display: { md: "none" } }}>
        <Box sx={{ width: 280 }} role="presentation">
          <Stack
            direction="row"
            sx={{ alignItems: "center", justifyContent: "space-between", p: 2 }}
          >
            <Typography variant="h6">Menu</Typography>
            <IconButton onClick={closeDrawer} aria-label="Close navigation menu">
              <CloseIcon />
            </IconButton>
          </Stack>
          <Divider />
          <List onClick={closeDrawer}>
            <ListItemButton component={RouterLink} to="/">
              <ListItemText primary="Home" />
            </ListItemButton>
            <ListItemButton component={RouterLink} to="/browse">
              <ListItemText primary="All products" />
            </ListItemButton>
            <ListItemButton component={RouterLink} to="/cart">
              <ListItemText primary={itemCount > 0 ? `Cart (${itemCount})` : "Cart"} />
            </ListItemButton>
          </List>
          <Divider />
          <List subheader={<ListSubheader disableSticky>Categories</ListSubheader>} onClick={closeDrawer}>
            {categories.map((category) => (
              <ListItemButton key={category} component={RouterLink} to={categoryPath(category)}>
                <ListItemText primary={category} />
              </ListItemButton>
            ))}
          </List>
          <Divider />
          <Box sx={{ p: 2 }}>
            {user ? (
              <Stack spacing={1}>
                <Typography variant="body2" sx={{ fontWeight: 600 }} noWrap>
                  {user.name || "Your account"}
                </Typography>
                <Typography variant="caption" color="text.secondary" noWrap>
                  {user.email}
                </Typography>
                <Button
                  component={RouterLink}
                  to="/account"
                  variant="outlined"
                  onClick={closeDrawer}
                  fullWidth
                >
                  Account settings
                </Button>
                <Button onClick={handleLogout} fullWidth>
                  Sign out
                </Button>
              </Stack>
            ) : (
              <Stack spacing={1}>
                <Button
                  component={RouterLink}
                  to="/auth?mode=login"
                  variant="outlined"
                  onClick={closeDrawer}
                  fullWidth
                >
                  Sign in
                </Button>
                <Button
                  component={RouterLink}
                  to="/auth?mode=signup"
                  variant="contained"
                  onClick={closeDrawer}
                  fullWidth
                >
                  Create account
                </Button>
              </Stack>
            )}
          </Box>
        </Box>
      </Drawer>
    </AppBar>
  );
}
