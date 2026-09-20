import { Suspense, lazy, useEffect } from "react";
import { Navigate, Route, Routes, useLocation } from "react-router-dom";
import ColorModeProvider from "./context/ColorModeProvider";
import AuthProvider from "./context/AuthProvider";
import CatalogProvider from "./context/CatalogProvider";
import CartProvider from "./context/CartProvider";
import Navbar from "./components/Navbar";
import SiteFooter from "./components/SiteFooter";
import RequireAuth from "./components/RequireAuth";
import { RouteFallback } from "./components/Skeletons";
import AppFlash from "./components/AppFlash";
import ErrorBoundary from "./components/ErrorBoundary";
import Home from "./pages/Home";
import Account from "./pages/Account";

const Browse = lazy(() => import("./pages/Browse"));
const ProductDetails = lazy(() => import("./pages/ProductDetails"));
const Cart = lazy(() => import("./pages/Cart"));
const Checkout = lazy(() => import("./pages/Checkout"));
const CheckoutSuccess = lazy(() => import("./pages/CheckoutSuccess"));
const Auth = lazy(() => import("./pages/Auth"));
const NotFound = lazy(() => import("./pages/NotFound"));

function AppRoutes() {
  const location = useLocation();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [location.pathname]);

  return (
    <ErrorBoundary resetKey={location.key}>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/browse" element={<Browse />} />
        <Route path="/products/:id" element={<ProductDetails />} />
        <Route path="/cart" element={<Cart />} />
        <Route
          path="/checkout"
          element={
            <RequireAuth>
              <Checkout />
            </RequireAuth>
          }
        />
        <Route
          path="/checkout/success"
          element={
            <RequireAuth>
              <CheckoutSuccess />
            </RequireAuth>
          }
        />
        <Route
          path="/account"
          element={
            <RequireAuth>
              <Account />
            </RequireAuth>
          }
        />
        <Route path="/auth" element={<Auth />} />
        <Route path="/payment" element={<Navigate to="/checkout" replace />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </ErrorBoundary>
  );
}

export default function App() {
  return (
    <ColorModeProvider>
      <AuthProvider>
        <CatalogProvider>
          <CartProvider>
            <ErrorBoundary>
              <AppFlash />
              <Navbar />
              <main className="flex-grow">
                <Suspense fallback={<RouteFallback />}>
                  <AppRoutes />
                </Suspense>
              </main>
              <SiteFooter />
            </ErrorBoundary>
          </CartProvider>
        </CatalogProvider>
      </AuthProvider>
    </ColorModeProvider>
  );
}
