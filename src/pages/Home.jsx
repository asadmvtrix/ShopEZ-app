import { useRef, useState } from "react";
import { Link } from "react-router-dom";
import ProductCard from "../components/ProductCard";
import { getProducts } from "../data/products";
import { useCart } from "../context/CartContext";

const GRID_OPTIONS = [2, 3, 4];

function GridToggle({ value, onChange }) {
  return (
    <div className="grid-toggle">
      {GRID_OPTIONS.map((cols) => (
        <button
          key={cols}
          type="button"
          className={`grid-toggle-btn ${value === cols ? "active" : ""}`}
          onClick={() => onChange(cols)}
          aria-label={`Show ${cols} columns`}
          title={`${cols} columns`}
        >
          <span className="grid-icon">
            {Array.from({ length: cols }).map((_, i) => (
              <span key={i} className="grid-icon-cell" />
            ))}
          </span>
        </button>
      ))}
    </div>
  );
}

function HeroCard({ product }) {
  const { addToCart, cartItems } = useCart();
  const inCart = cartItems.find((item) => item.id === product.id);

  return (
    <div className="hero-card">
      <Link to={`/products/${product.id}`} className="hero-card-link">
        <img
          src={product.image}
          alt={product.name}
          className="hero-card-image"
        />
      </Link>
      <div className="hero-card-body">
        <Link
          to={`/products/${product.id}`}
          className="hero-card-name"
        >
          {product.name}
        </Link>
        <p className="hero-card-price">${product.price}</p>
        <div className="hero-card-actions">
          <button
            className="btn btn-primary btn-small"
            onClick={() => addToCart(product.id)}
          >
            Add to Cart{inCart ? ` (${inCart.quantity})` : ""}
          </button>
          <Link
            to={`/products/${product.id}`}
            className="btn btn-secondary btn-small"
          >
            Details
          </Link>
        </div>
      </div>
    </div>
  );
}

export default function Home() {
  const products = getProducts();
  const popularProducts = [products[0], products[2], products[3], products[6], products[9], products[10], products[13], products[17]];
  const featuredProducts = [products[1], products[4], products[5], products[7], products[11], products[14]];
  const remainingProducts = products.filter((p) => !popularProducts.includes(p) && !featuredProducts.includes(p));
  const scrollRef = useRef(null);
  const [featuredCols, setFeaturedCols] = useState(3);
  const [moreCols, setMoreCols] = useState(4);

  function scroll(direction) {
    if (!scrollRef.current) return;
    const px = direction === "left" ? -340 : 340;
    scrollRef.current.scrollBy({ left: px, behavior: "smooth" });
  }

  return (
    <div className="page">
      <div className="hero-section">
        <div className="hero-section-head">
          <div>
            <h2 className="hero-section-title">Popular Right Now</h2>
            <p className="hero-section-sub">Top picks from our store</p>
          </div>
          <div className="hero-section-arrows">
            <button
              type="button"
              className="hero-arrow"
              onClick={() => scroll("left")}
              aria-label="Scroll left"
            >
              &#8249;
            </button>
            <button
              type="button"
              className="hero-arrow"
              onClick={() => scroll("right")}
              aria-label="Scroll right"
            >
              &#8250;
            </button>
          </div>
        </div>
        <div className="hero-scroll-wrapper">
          <div className="hero-scroll-track" ref={scrollRef}>
            {popularProducts.map((product) => (
              <HeroCard product={product} key={product.id} />
            ))}
          </div>
        </div>
      </div>

      <div className="container" id="why-us">
        <div className="home-info-grid">
          <div className="home-info-card">
            <h3>Fast Shipping</h3>
            <p>Dispatch within 24 hours on most items.</p>
          </div>
          <div className="home-info-card">
            <h3>Verified Products</h3>
            <p>Only high-quality, tested tech accessories and parts.</p>
          </div>
          <div className="home-info-card">
            <h3>Secure Payments</h3>
            <p>Protected checkout and reliable order tracking.</p>
          </div>
        </div>
      </div>

      <div className="container">
        <div className="browse-all-banner">
          <div>
            <h2 className="browse-all-title">Browse Our Full Catalog</h2>
            <p className="browse-all-sub">
              {products.length} products across {new Set(products.map((p) => p.category)).size} categories
            </p>
          </div>
          <Link to="/browse" className="btn btn-primary">
            View All Products
          </Link>
        </div>
      </div>

      <div className="container">
        <div className="section-header">
          <h2 className="page-title" id="catalog">
            Featured Products
          </h2>
          <GridToggle value={featuredCols} onChange={setFeaturedCols} />
        </div>
        <div className={`product-grid cols-${featuredCols} home-featured-grid`}>
          {featuredProducts.map((product) => (
            <ProductCard product={product} key={product.id} />
          ))}
        </div>
      </div>

      <div className="container home-more-products">
        <div className="section-header">
          <h2 className="page-title">More to Explore</h2>
          <GridToggle value={moreCols} onChange={setMoreCols} />
        </div>
        <div className={`product-grid cols-${moreCols}`}>
          {remainingProducts.map((product) => (
            <ProductCard product={product} key={product.id} />
          ))}
        </div>
      </div>
    </div>
  );
}
