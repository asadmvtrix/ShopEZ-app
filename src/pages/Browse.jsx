import { useMemo, useState, useEffect } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { getProducts } from "../data/products";
import { useCart } from "../context/CartContext";

const SORT_OPTIONS = [
  { value: "featured", label: "Featured" },
  { value: "price-low", label: "Price: Low to High" },
  { value: "price-high", label: "Price: High to Low" },
  { value: "name-az", label: "Name: A to Z" },
  { value: "name-za", label: "Name: Z to A" },
];

const PRICE_RANGES = [
  { label: "All Prices", min: 0, max: Infinity },
  { label: "Under $100", min: 0, max: 100 },
  { label: "$100 - $250", min: 100, max: 250 },
  { label: "$250 - $500", min: 250, max: 500 },
  { label: "$500 - $1000", min: 500, max: 1000 },
  { label: "Over $1000", min: 1000, max: Infinity },
];

export default function Browse() {
  const allProducts = getProducts();
  const { addToCart, cartItems } = useCart();
  const [searchParams, setSearchParams] = useSearchParams();

  const [selectedCategory, setSelectedCategory] = useState("All");
  const [selectedPrice, setSelectedPrice] = useState(0);
  const [sortBy, setSortBy] = useState("featured");
  const [searchQuery, setSearchQuery] = useState("");

  // Keep the sidebar category in sync with ?category= in the URL (navbar links)
  useEffect(() => {
    const category = searchParams.get("category");
    if (category) {
      setSelectedCategory(category);
    }
  }, [searchParams]);

  const categories = useMemo(() => {
    const cats = [...new Set(allProducts.map((p) => p.category))].sort();
    return ["All", ...cats];
  }, [allProducts]);

  const filteredProducts = useMemo(() => {
    let result = [...allProducts];

    if (selectedCategory !== "All") {
      result = result.filter((p) => p.category === selectedCategory);
    }

    const priceRange = PRICE_RANGES[selectedPrice];
    if (priceRange) {
      result = result.filter(
        (p) => p.price >= priceRange.min && p.price < priceRange.max
      );
    }

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter(
        (p) =>
          p.name.toLowerCase().includes(q) ||
          p.category.toLowerCase().includes(q)
      );
    }

    switch (sortBy) {
      case "price-low":
        result.sort((a, b) => a.price - b.price);
        break;
      case "price-high":
        result.sort((a, b) => b.price - a.price);
        break;
      case "name-az":
        result.sort((a, b) => a.name.localeCompare(b.name));
        break;
      case "name-za":
        result.sort((a, b) => b.name.localeCompare(a.name));
        break;
      default:
        break;
    }

    return result;
  }, [allProducts, selectedCategory, selectedPrice, sortBy, searchQuery]);

  function selectCategory(cat) {
    setSelectedCategory(cat);
    const params = new URLSearchParams(searchParams);
    if (cat === "All") {
      params.delete("category");
    } else {
      params.set("category", cat);
    }
    setSearchParams(params, { replace: true });
  }

  function resetFilters() {
    setSelectedCategory("All");
    setSelectedPrice(0);
    setSortBy("featured");
    setSearchQuery("");
    setSearchParams({}, { replace: true });
  }

  return (
    <div className="page">
      <div className="container">
        <div className="browse-header">
          <div>
            <h1 className="browse-title">All Products</h1>
            <p className="browse-count">{filteredProducts.length} products found</p>
          </div>
        </div>

        <div className="browse-layout">
          <aside className="browse-sidebar">
            <div className="filter-group">
              <h3 className="filter-heading">Search</h3>
              <input
                type="text"
                className="filter-search"
                placeholder="Search products..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>

            <div className="filter-group">
              <h3 className="filter-heading">Category</h3>
              <div className="filter-list">
                {categories.map((cat) => (
                  <button
                    key={cat}
                    type="button"
                    className={`filter-item ${selectedCategory === cat ? "active" : ""}`}
                    onClick={() => selectCategory(cat)}
                  >
                    {cat}
                    {cat !== "All" && (
                      <span className="filter-count">
                        {allProducts.filter((p) => p.category === cat).length}
                      </span>
                    )}
                  </button>
                ))}
              </div>
            </div>

            <div className="filter-group">
              <h3 className="filter-heading">Price Range</h3>
              <div className="filter-list">
                {PRICE_RANGES.map((range, index) => (
                  <button
                    key={range.label}
                    type="button"
                    className={`filter-item ${selectedPrice === index ? "active" : ""}`}
                    onClick={() => setSelectedPrice(index)}
                  >
                    {range.label}
                  </button>
                ))}
              </div>
            </div>

            <button
              type="button"
              className="filter-reset"
              onClick={resetFilters}
            >
              Clear All Filters
            </button>
          </aside>

          <div className="browse-main">
            <div className="browse-toolbar">
              <span className="browse-sort-label">Sort by:</span>
              <select
                className="browse-sort-select"
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
              >
                {SORT_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </div>

            {filteredProducts.length === 0 ? (
              <div className="browse-empty">
                <p>No products match your filters.</p>
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={resetFilters}
                >
                  Reset Filters
                </button>
              </div>
            ) : (
              <div className="browse-grid">
                {filteredProducts.map((product) => {
                  const inCart = cartItems.find((item) => item.id === product.id);
                  return (
                    <div className="browse-card" key={product.id}>
                      <Link
                        to={`/products/${product.id}`}
                        className="browse-card-image-link"
                      >
                        {product.image ? (
                          <img
                            src={product.image}
                            alt={product.name}
                            className="browse-card-image"
                          />
                        ) : (
                          <div className="browse-card-image-placeholder">
                            {product.name.charAt(0)}
                          </div>
                        )}
                      </Link>
                      <div className="browse-card-body">
                        <p className="browse-card-category">{product.category}</p>
                        <Link
                          to={`/products/${product.id}`}
                          className="browse-card-name"
                        >
                          {product.name}
                        </Link>
                        <p className="browse-card-price">${product.price}</p>
                        <div className="browse-card-actions">
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
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
