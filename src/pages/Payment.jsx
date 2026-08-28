import { useState } from "react";
import { Link } from "react-router-dom";
import { useCart } from "../context/CartContext";
import { usePayment } from "../hooks/usePayment";

const SHIPPING_FEE = 9.99;
const TAX_RATE = 0.08;

export default function Payment() {
  const {
    getCartItemsWithProducts,
    getCartTotal,
    clearCart,
  } = useCart();
  const cartItems = getCartItemsWithProducts();
  const subtotal = getCartTotal();
  const shipping = subtotal >= 99 ? 0 : SHIPPING_FEE;
  const tax = subtotal * TAX_RATE;
  const total = subtotal + shipping + tax;

  const [cardName, setCardName] = useState("");
  const [cardNumber, setCardNumber] = useState("");
  const [expiry, setExpiry] = useState("");
  const [cvv, setCvv] = useState("");
  const [validationError, setValidationError] = useState("");
  const { isProcessing, paymentError, paymentSuccess, processPayment } = usePayment();

  // Helper: Format Card Number (XXXX XXXX XXXX XXXX)
  const formatCardNumber = (value) => {
    return value
      .replace(/\D/g, "")
      .replace(/(\d{4})(?=\d)/g, "$1 ")
      .slice(0, 19);
  };

  // Helper: Format Expiry (MM/YY)
  const formatExpiry = (value) => {
    return value
      .replace(/\D/g, "")
      .replace(/(\d{2})(\d{0,2})/, "$1/$2")
      .slice(0, 5);
  };

  const handleCardNumberChange = (e) => setCardNumber(formatCardNumber(e.target.value));
  const handleExpiryChange = (e) => setExpiry(formatExpiry(e.target.value));

  if (cartItems.length === 0 && !paymentSuccess) {
    return (
      <div className="page">
        <div className="container">
          <h1 className="page-title">Secure Checkout</h1>
          <div className="empty-cart">
            <p>No items to pay for.</p>
            <Link to="/browse" className="btn btn-primary">
              Browse Products
            </Link>
          </div>
        </div>
      </div>
    );
  }

  if (paymentSuccess) {
    return (
      <div className="page">
        <div className="container">
          <div className="payment-success">
            <div className="payment-success-icon">&#10003;</div>
            <h1 className="payment-success-title">Payment Confirmed</h1>
            <p className="payment-success-ref">
              Order Reference: <strong>{paymentSuccess.paymentId}</strong>
            </p>
            <div className="payment-success-amount">
              Charged ${(paymentSuccess.amount ?? total).toFixed(2)}
            </div>
            <p className="payment-success-msg">
              Thank you for your purchase. A confirmation email has been sent to your inbox.
            </p>
            <Link to="/" className="btn btn-primary">
              Continue Shopping
            </Link>
          </div>
        </div>
      </div>
    );
  }

  function detectBrand(number) {
    const digits = number.replace(/\s+/g, "");
    if (/^4/.test(digits)) return "Visa";
    if (/^5[1-5]/.test(digits) || /^2[2-7]/.test(digits)) return "Mastercard";
    if (/^3[47]/.test(digits)) return "Amex";
    if (/^6/.test(digits)) return "Discover";
    return "";
  }

  function validate() {
    if (!cardName.trim()) {
      setValidationError("Enter the cardholder name exactly as shown on the card.");
      return false;
    }
    if (cardNumber.replace(/\s+/g, "").length !== 16) {
      setValidationError("Enter a valid 16-digit card number.");
      return false;
    }
    if (!/^\d{2}\/\d{2}$/.test(expiry)) {
      setValidationError("Use MM/YY format, e.g. 12/27.");
      return false;
    }
    const [mm, yy] = expiry.split("/").map(Number);
    const now = new Date();
    const expYear = 2000 + yy;
    if (mm < 1 || mm > 12 || expYear < now.getFullYear() || (expYear === now.getFullYear() && mm < now.getMonth() + 1)) {
      setValidationError("This card has expired. Please check the expiry date.");
      return false;
    }
    if (!/^\d{3,4}$/.test(cvv)) {
      setValidationError("Enter the 3 or 4-digit security code (CVV).");
      return false;
    }
    setValidationError("");
    return true;
  }

  async function handlePayment(e) {
    e.preventDefault();
    if (!validate()) return;

    const payload = {
      amount: Number(total.toFixed(2)),
      subtotal: Number(subtotal.toFixed(2)),
      shipping: Number(shipping.toFixed(2)),
      tax: Number(tax.toFixed(2)),
      items: cartItems.map((item) => ({
        id: item.id,
        name: item.product.name,
        quantity: item.quantity,
        unitPrice: item.product.price,
      })),
      billing: { name: cardName },
      cardMeta: {
        brand: detectBrand(cardNumber),
        last4: cardNumber.replace(/\s+/g, "").slice(-4),
        expiry,
      },
      createdAt: new Date().toISOString(),
    };

    const result = await processPayment(payload);
    if (result.success) {
      clearCart();
    }
  }

  const brand = detectBrand(cardNumber);

  return (
    <div className="page">
      <div className="container">
        <h1 className="page-title">Secure Checkout</h1>

        <div className="payment-steps">
          <span className="payment-step done">✓ Cart</span>
          <span className="payment-step-sep" />
          <span className="payment-step active">Payment</span>
          <span className="payment-step-sep" />
          <span className="payment-step">Confirmation</span>
        </div>

        <div className="payment-layout">
          <form className="payment-card-section" onSubmit={handlePayment} noValidate>
            {/* Live card preview */}
            <div className={`payment-card ${brand ? `brand-${brand.toLowerCase()}` : "brand-default"}`}>
              <div className="payment-card-top">
                <span className="payment-card-chip" />
                <span className="payment-card-brand">{brand || "CREDIT"}</span>
              </div>
              <div className="payment-card-number">
                {cardNumber || "**** **** **** ****"}
              </div>
              <div className="payment-card-footer">
                <div>
                  <span className="payment-card-label">Card Holder</span>
                  <span className="payment-card-value">{cardName.toUpperCase() || "YOUR NAME"}</span>
                </div>
                <div>
                  <span className="payment-card-label">Expires</span>
                  <span className="payment-card-value">{expiry || "MM/YY"}</span>
                </div>
              </div>
            </div>

            <div className="payment-form">
              <label className="payment-label" htmlFor="cardName">Cardholder Name</label>
              <input
                id="cardName"
                className="payment-input"
                type="text"
                value={cardName}
                onChange={(e) => setCardName(e.target.value)}
                placeholder="Jane Doe"
              />

              <label className="payment-label" htmlFor="cardNumber">Card Number</label>
              <input
                id="cardNumber"
                className="payment-input"
                type="text"
                value={cardNumber}
                onChange={handleCardNumberChange}
                placeholder="0000 0000 0000 0000"
                maxLength={19}
              />

              <div className="payment-row">
                <div>
                  <label className="payment-label" htmlFor="expiry">Expiry</label>
                  <input
                    id="expiry"
                    className="payment-input"
                    type="text"
                    value={expiry}
                    onChange={handleExpiryChange}
                    placeholder="MM/YY"
                    maxLength={5}
                  />
                </div>
                <div>
                  <label className="payment-label" htmlFor="cvv">CVV</label>
                  <input
                    id="cvv"
                    className="payment-input"
                    type="password"
                    value={cvv}
                    onChange={(e) => setCvv(e.target.value.replace(/\D/g, ""))}
                    placeholder="123"
                    maxLength={4}
                  />
                </div>
              </div>

              <div className="payment-secure-note">
                <span className="payment-secure-icon">&#128274;</span>
                Your payment information is encrypted and processed securely. We never store your full card details.
              </div>

              {validationError && (
                <p className="payment-message payment-message-error">{validationError}</p>
              )}
              {paymentError && (
                <p className="payment-message payment-message-error">{paymentError}</p>
              )}

              <button
                type="submit"
                className="btn btn-primary btn-block"
                disabled={isProcessing}
              >
                {isProcessing ? (
                  <span className="payment-spinner" />
                ) : (
                  `Pay $${total.toFixed(2)}`
                )}
              </button>

              <p className="payment-terms">
                By completing this purchase you agree to our Terms of Service and Privacy Policy.
              </p>
            </div>
          </form>

          <div className="payment-sidebar">
            <div className="cart-summary">
              <h3 className="cart-summary-title">Order Summary</h3>
              <div className="cart-summary-rows">
                {cartItems.map((item) => (
                  <div className="cart-summary-row" key={item.id}>
                    <span className="cart-summary-item-name">
                      {item.product.name}
                      <span className="cart-summary-qty"> × {item.quantity}</span>
                    </span>
                    <span className="cart-summary-item-total">
                      ${(item.product.price * item.quantity).toFixed(2)}
                    </span>
                  </div>
                ))}
              </div>
              <div className="cart-summary-divider" />
              <div className="cart-summary-row">
                <span>Subtotal</span>
                <span>${subtotal.toFixed(2)}</span>
              </div>
              <div className="cart-summary-row">
                <span>Shipping</span>
                <span>{shipping === 0 ? <span className="cart-shipping-free">Free</span> : `$${shipping.toFixed(2)}`}</span>
              </div>
              <div className="cart-summary-row">
                <span>Estimated Tax (8%)</span>
                <span>${tax.toFixed(2)}</span>
              </div>
              <div className="cart-summary-divider" />
              <div className="cart-summary-row cart-summary-total">
                <span>Total Due</span>
                <span>${total.toFixed(2)}</span>
              </div>
              <p className="cart-summary-item-count">
                {cartItems.reduce((n, i) => n + i.quantity, 0)} item(s)
              </p>
              <Link to="/checkout" className="payment-back-link">
                ← Back to Cart
              </Link>
            </div>

            <div className="payment-trust">
              <div className="payment-trust-item">
                <span className="payment-trust-icon">&#128274;</span>
                <span>SSL Encrypted</span>
              </div>
              <div className="payment-trust-item">
                <span className="payment-trust-icon">&#10003;</span>
                <span>PCI Compliant</span>
              </div>
              <div className="payment-trust-item">
                <span className="payment-trust-icon">&#8634;</span>
                <span>30-Day Returns</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
