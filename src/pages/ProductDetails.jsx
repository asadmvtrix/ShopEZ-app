import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { getProductById } from "../data/products";
import { useCart } from "../context/CartContext";
import { useProductInfo } from "../hooks/useProductInfo";

export default function ProductDetails() {
  const { id } = useParams();
  const [product, setProduct] = useState(null);
  const [activeTab, setActiveTab] = useState("description");
  const navigate = useNavigate();
  const { addToCart, cartItems } = useCart();

  useEffect(() => {
    const foundProduct = getProductById(id);

    if (!foundProduct) {
      navigate("/");
      return;
    }

    setProduct(foundProduct);
  }, [id]);

  const productInfo = useProductInfo(product);

  if (!product) {
    return <h1>Loading...</h1>;
  }

  const productInCart = cartItems.find((item) => item.id === product.id);

  const productQuantityLabel = productInCart
    ? `(${productInCart.quantity})`
    : "";

  let tabContent = null;
  if (activeTab === "description") {
    tabContent = (
      <p className="product-detail-description">{product.description}</p>
    );
  } else if (activeTab === "specs") {
    tabContent = (
      <ul className="product-spec-list">
        <li>
          <span>Category</span>
          <strong>{productInfo.category}</strong>
        </li>
        <li>
          <span>SKU</span>
          <strong>{productInfo.sku}</strong>
        </li>
        <li>
          <span>Availability</span>
          <strong>{productInfo.stockText}</strong>
        </li>
        <li>
          <span>Rating</span>
          <strong>
            {productInfo.rating} / 5 ({productInfo.reviewCount} reviews)
          </strong>
        </li>
      </ul>
    );
  } else {
    tabContent = (
      <ul className="product-shipping-list">
        <li>{productInfo.shipping}</li>
        <li>{productInfo.returns}</li>
        <li>{productInfo.warranty}</li>
      </ul>
    );
  }

  return (
    <div className="page">
      <div className="container">
        <div className="product-detail">
          <div className="product-detail-image">
            <img src={product.image} alt={product.name} />
          </div>
          <div className="product-detail-content">
            <p className="product-detail-category">{productInfo.category}</p>
            <h1 className="product-detail-name">{product.name}</h1>
            <div className="product-detail-meta">
              <span>SKU: {productInfo.sku}</span>
              <span className="product-stock">{productInfo.stockText}</span>
            </div>
            <div className="product-detail-rating">
              <strong>{productInfo.rating}</strong>
              <span>({productInfo.reviewCount} reviews)</span>
            </div>
            <p className="product-detail-price">${product.price}</p>
            <div className="product-details-section">
              <h2 className="product-details-heading">Product Details</h2>
              <div
                className="product-detail-tabs"
                role="tablist"
                aria-label="Product details tabs"
              >
                <button
                  className={`product-tab ${
                    activeTab === "description" ? "active" : ""
                  }`}
                  onClick={() => setActiveTab("description")}
                  role="tab"
                  aria-selected={activeTab === "description"}
                  type="button"
                >
                  Description
                </button>
                <button
                  className={`product-tab ${activeTab === "specs" ? "active" : ""}`}
                  onClick={() => setActiveTab("specs")}
                  role="tab"
                  aria-selected={activeTab === "specs"}
                  type="button"
                >
                  Specifications
                </button>
                <button
                  className={`product-tab ${activeTab === "shipping" ? "active" : ""}`}
                  onClick={() => setActiveTab("shipping")}
                  role="tab"
                  aria-selected={activeTab === "shipping"}
                  type="button"
                >
                  Shipping & Returns
                </button>
              </div>

              <div className="product-tab-panel" role="tabpanel">
                {tabContent}
              </div>
            </div>

            <ul className="product-feature-list">
              <li>Quality checked before dispatch</li>
              <li>Compatible with modern setups and accessories</li>
              <li>Backed by verified post-purchase support</li>
            </ul>
            <button
              className="btn btn-primary product-cta"
              onClick={() => addToCart(product.id)}
            >
              Add to Cart {productQuantityLabel}
            </button>
            <div className="product-support-note">
              Need help? Our support team responds within one business day.
            </div>
            <div className="product-assurance-grid">
              <div className="product-assurance-item">
                <h4>Authenticity</h4>
                <p>Shipped from verified suppliers only.</p>
              </div>
              <div className="product-assurance-item">
                <h4>Delivery</h4>
                <p>Live tracking with shipping updates.</p>
              </div>
              <div className="product-assurance-item">
                <h4>Support</h4>
                <p>Order and technical help available.</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
