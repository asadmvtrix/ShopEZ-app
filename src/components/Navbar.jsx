import { useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useTheme } from "../context/ThemeContext";
import { useCart } from "../context/CartContext";

const CATEGORIES = [
  { label: "PC Components", path: "/browse?category=PC+Components" },
  { label: "Peripherals", path: "/browse?category=Peripherals" },
  { label: "Audio", path: "/browse?category=Audio" },
  { label: "Displays", path: "/browse?category=Displays" },
  { label: "Storage", path: "/browse?category=Storage" },
];

export default function Navbar() {
  const { user, logout } = useAuth();
  const { darkMode, toggleTheme } = useTheme();
  const { cartItems } = useCart();
  const [menuOpen, setMenuOpen] = useState(false);

  const cartCount = cartItems.reduce((sum, item) => sum + item.quantity, 0);
  const close = () => setMenuOpen(false);

  return (
    <>
      <nav className="navbar">
        <div className="navbar-container">
          <div className="navbar-brand-wrap">
            <Link to="/" className="navbar-brand" onClick={close}>
              <svg className="navbar-logo" viewBox="0 0 32 32" fill="none" aria-hidden="true">
                <rect width="32" height="32" rx="6" fill="currentColor" />
                <path d="M8 16L13 21L24 11" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              ShopEZ
            </Link>
            <button
              className="hamburger"
              type="button"
              onClick={() => setMenuOpen((v) => !v)}
              aria-label="Toggle menu"
            >
              <span className={`hamburger-bar ${menuOpen ? "open" : ""}`} />
              <span className={`hamburger-bar ${menuOpen ? "open" : ""}`} />
              <span className={`hamburger-bar ${menuOpen ? "open" : ""}`} />
            </button>
          </div>

          <div className="navbar-nav">
            <Link to="/" className="navbar-link" onClick={close}>
              Home
            </Link>
            <div className="navbar-dropdown">
              <button type="button" className="navbar-link navbar-dropdown-trigger">
                Categories
              </button>
              <div className="navbar-dropdown-menu">
                {CATEGORIES.map((cat) => (
                  <Link
                    key={cat.label}
                    to={cat.path}
                    className="navbar-dropdown-item"
                    onClick={close}
                  >
                    {cat.label}
                  </Link>
                ))}
              </div>
            </div>
            <Link to="/browse" className="navbar-link" onClick={close}>
              Shop Now
            </Link>
          </div>

          <div className="navbar-actions">
            <Link to="/checkout" className="navbar-cart" onClick={close} aria-label="Cart">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="9" cy="21" r="1" />
                <circle cx="20" cy="21" r="1" />
                <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6" />
              </svg>
              {cartCount > 0 && <span className="cart-badge">{cartCount}</span>}
            </Link>

            {!user ? (
              <div className="navbar-auth-links">
                <Link to="/auth?mode=login" className="btn btn-secondary btn-small" onClick={close}>Login</Link>
                <Link to="/auth?mode=signup" className="btn btn-primary btn-small" onClick={close}>Signup</Link>
              </div>
            ) : (
              <div className="navbar-user">
                <span className="navbar-greeting">{user.email}</span>
                <button className="btn btn-secondary btn-small" onClick={() => { logout(); close(); }}>Logout</button>
              </div>
            )}

            <button className="theme-toggle" onClick={toggleTheme} aria-label="Toggle theme" title={darkMode ? "Light mode" : "Dark mode"}>
              {darkMode ? (
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="5" />
                  <line x1="12" y1="1" x2="12" y2="3" /><line x1="12" y1="21" x2="12" y2="23" />
                  <line x1="4.22" y1="4.22" x2="5.64" y2="5.64" /><line x1="18.36" y1="18.36" x2="19.78" y2="19.78" />
                  <line x1="1" y1="12" x2="3" y2="12" /><line x1="21" y1="12" x2="23" y2="12" />
                  <line x1="4.22" y1="19.78" x2="5.64" y2="18.36" /><line x1="18.36" y1="5.64" x2="19.78" y2="4.22" />
                </svg>
              ) : (
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
                </svg>
              )}
            </button>
          </div>
        </div>
      </nav>

      {menuOpen && (
        <div className="mobile-drawer" role="dialog" aria-label="Navigation menu">
          <div className="mobile-drawer-backdrop" onClick={close} />
          <div className="mobile-drawer-panel">
            <div className="mobile-drawer-header">
              <span className="mobile-drawer-title">Menu</span>
              <button className="mobile-drawer-close" type="button" onClick={close} aria-label="Close menu">&#10005;</button>
            </div>
            <div className="mobile-drawer-body">
              <div className="mobile-drawer-section">
                <Link to="/" className="mobile-drawer-link" onClick={close}>Home</Link>
                <Link to="/browse" className="mobile-drawer-link" onClick={close}>Shop Now</Link>
                <Link to="/checkout" className="mobile-drawer-link" onClick={close}>Cart{cartCount > 0 ? ` (${cartCount})` : ""}</Link>
              </div>
              <div className="mobile-drawer-section">
                <p className="mobile-drawer-label">Categories</p>
                {CATEGORIES.map((cat) => (
                  <Link key={cat.label} to={cat.path} className="mobile-drawer-link mobile-drawer-sub" onClick={close}>{cat.label}</Link>
                ))}
              </div>
              <div className="mobile-drawer-section">
                {!user ? (
                  <>
                    <Link to="/auth?mode=login" className="btn btn-secondary btn-small" onClick={close}>Login</Link>
                    <Link to="/auth?mode=signup" className="btn btn-primary btn-small" onClick={close}>Signup</Link>
                  </>
                ) : (
                  <>
                    <p className="mobile-drawer-label">{user.email}</p>
                    <button className="btn btn-secondary btn-small" onClick={() => { logout(); close(); }}>Logout</button>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
