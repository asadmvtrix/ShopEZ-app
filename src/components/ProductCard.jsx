import { Link } from "react-router-dom";
import { useCart } from "../context/CartContext";

export default function ProductCard({ product }) {
  const { addToCart, cartItems } = useCart();
  const productInCart = cartItems.find((item) => item.id === product.id);

  const productQuantityLabel = productInCart
    ? `(${productInCart.quantity})`
    : "";
  return (
    <div className="product-card">
      <Link to={`/products/${product.id}`} className="product-card-image-link">
        <img
          src={product.image}
          alt={product.name}
          className="product-card-image"
        />
      </Link>
      <div className="product-card-content">
        <h3 className="product-card-name">
          <Link to={`/products/${product.id}`}>
            {product.name}
          </Link>
        </h3>
        <p className="product-card-price">${product.price}</p>
        <div className="product-card-actions">
          <button
            className="btn btn-primary btn-small"
            onClick={() => addToCart(product.id)}
          >
            Add to Cart{productQuantityLabel}
          </button>
          <Link
            className="btn btn-secondary btn-small"
            to={`/products/${product.id}`}
          >
            View Details
          </Link>
        </div>
      </div>
    </div>
  );
}
