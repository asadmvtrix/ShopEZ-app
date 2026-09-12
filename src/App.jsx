import { Suspense, lazy } from "react";
import { Navigate, Route, Routes } from "react-router-dom";
import Box from "@mui/material/Box";
import ColorModeProvider from "./context/ColorModeProvider";
import AuthProvider from "./context/AuthProvider";
import CatalogProvider from "./context/CatalogProvider";
import CartProvider from "./context/CartProvider";
import Navbar from "./components/Navbar";
import SiteFooter from "./components/SiteFooter";
import RequireAuth from "./components/RequireAuth";
import ScrollToTop from "./components/ScrollToTop";
import PageEnter from "./components/PageEnter";
import RouteFallback from "./components/RouteFallback";
import AppFlash from "./components/AppFlash";
import ErrorBoundary from "./components/ErrorBoundary";
import GlobalErrorBridge from "./components/GlobalErrorBridge";
import Home from "./pages/Home";

const Browse = lazy(() => import("./pages/Browse"));
const ProductDetails = lazy(() => import("./pages/ProductDetails"));
const Cart = lazy(() => import("./pages/Cart"));
const Checkout = lazy(() => import("./pages/Checkout"));
const Auth = lazy(() => import("./pages/Auth"));
const Account = lazy(() => import("./pages/Account"));
const NotFound = lazy(() => import("./pages/NotFound"));

export default function App() {
  return (
    <ColorModeProvider>
      <AuthProvider>
        <CatalogProvider>
          <CartProvider>
            <ScrollToTop />
            <GlobalErrorBridge />
            <AppFlash />
            <ErrorBoundary>
              <Navbar />
              <Box component="main" sx={{ flexGrow: 1 }}>
                <Suspense fallback={<RouteFallback />}>
                  <PageEnter>
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
                  </PageEnter>
                </Suspense>
              </Box>
              <SiteFooter />
            </ErrorBoundary>
          </CartProvider>
        </CatalogProvider>
      </AuthProvider>
    </ColorModeProvider>
  );
}
