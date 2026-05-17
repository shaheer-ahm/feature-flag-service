import { useState, useEffect } from "react";
import axios from "axios";

const API_URL = import.meta.env.VITE_API_URL;
const API_KEY = import.meta.env.VITE_API_KEY;

const api = axios.create({
  baseURL: API_URL,
  headers: { "x-api-key": API_KEY },
});

const PRODUCTS = [
  { id: 1, name: "Product One", price: 29.99, rating: 4.2, badge: "New" },
  { id: 2, name: "Product Two", price: 49.99, rating: 3.8, badge: null },
  { id: 3, name: "Product Three", price: 19.99, rating: 4.7, badge: "New" },
  { id: 4, name: "Product Four", price: 89.99, rating: 4.0, badge: null },
  { id: 5, name: "Product Five", price: 34.99, rating: 4.5, badge: "Sale" },
  { id: 6, name: "Product Six", price: 14.99, rating: 3.5, badge: null },
];

const RECOMMENDED = [
  { id: 7, name: "Product Seven", price: 24.99 },
  { id: 8, name: "Product Eight", price: 39.99 },
  { id: 9, name: "Product Nine", price: 54.99 },
];

const styles = {
  page: {
    minHeight: "100vh",
    background: "#f4f5f7",
    fontFamily: "'Segoe UI', system-ui, sans-serif",
  },
  header: {
    background: "#0f1f3d",
    color: "#fff",
    padding: "0 40px",
    height: 56,
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
  },
  headerTitle: {
    margin: 0,
    fontSize: 18,
    fontWeight: 600,
    letterSpacing: 0.3,
  },
  nav: {
    display: "flex",
    gap: 28,
    fontSize: 13,
    color: "#8899bb",
  },
  promoBanner: {
    background: "#f5a623",
    color: "#fff",
    textAlign: "center",
    padding: "10px 0",
    fontWeight: 600,
    fontSize: 14,
    letterSpacing: 0.3,
  },
  main: {
    maxWidth: 960,
    margin: "0 auto",
    padding: "36px 20px",
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 600,
    color: "#0f1f3d",
    marginBottom: 20,
    marginTop: 0,
  },
  grid: {
    display: "grid",
    gridTemplateColumns: "repeat(3, 1fr)",
    gap: 20,
    marginBottom: 48,
  },
  list: {
    marginBottom: 48,
  },
  card: {
    background: "#fff",
    border: "1px solid #e4e7ec",
    borderRadius: 10,
    overflow: "hidden",
    boxShadow: "0 1px 3px rgba(0,0,0,0.04)",
    position: "relative",
  },
  imagePlaceholder: {
    height: 160,
    background: "#eef0f3",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    color: "#c0c7d4",
    fontSize: 13,
  },
  cardBody: {
    padding: 16,
  },
  cardName: {
    fontWeight: 600,
    fontSize: 14,
    color: "#0f1f3d",
    marginBottom: 4,
  },
  cardPrice: {
    fontSize: 18,
    fontWeight: 700,
    color: "#0f1f3d",
    margin: "8px 0",
  },
  badge: (type) => ({
    position: "absolute",
    top: 10,
    left: 10,
    background: type === "Sale" ? "#c0392b" : "#0f1f3d",
    color: "#fff",
    fontSize: 11,
    fontWeight: 600,
    padding: "2px 8px",
    borderRadius: 20,
  }),
  stars: {
    color: "#f5a623",
    fontSize: 13,
  },
  starsGray: {
    color: "#ddd",
    fontSize: 13,
  },
  rating: {
    color: "#9aa3b2",
    fontSize: 12,
    marginLeft: 4,
  },
  btnGroup: {
    display: "flex",
    gap: 8,
    marginTop: 12,
  },
  btnCart: {
    flex: 1,
    padding: "8px 0",
    border: "1px solid #d1d5db",
    borderRadius: 6,
    background: "#fff",
    cursor: "pointer",
    fontSize: 13,
    color: "#374151",
    fontFamily: "inherit",
  },
  btnBuy: {
    flex: 1,
    padding: "8px 0",
    border: "none",
    borderRadius: 6,
    background: "#0f1f3d",
    color: "#fff",
    cursor: "pointer",
    fontSize: 13,
    fontFamily: "inherit",
  },
  listRow: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    padding: "12px 16px",
    marginBottom: 8,
    background: "#fff",
    border: "1px solid #e4e7ec",
    borderRadius: 8,
    boxShadow: "0 1px 3px rgba(0,0,0,0.04)",
  },
  listName: {
    fontWeight: 600,
    color: "#0f1f3d",
    fontSize: 14,
  },
  listPrice: {
    color: "#9aa3b2",
    fontSize: 13,
    marginLeft: 12,
  },
  footer: {
    textAlign: "center",
    padding: "20px 0",
    fontSize: 11,
    color: "#c0c7d4",
  },
  divider: {
    borderTop: "1px solid #e4e7ec",
    margin: "0 0 36px 0",
  },
};

function Stars({ rating }) {
  const full = Math.round(rating);
  const empty = 5 - full;
  return (
    <span>
      <span style={styles.stars}>{"★".repeat(full)}</span>
      <span style={styles.starsGray}>{"★".repeat(empty)}</span>
      <span style={styles.rating}>{rating.toFixed(1)}</span>
    </span>
  );
}

function ProductCard({ product, buyNow }) {
  return (
    <div style={styles.card}>
      {product.badge && (
        <div style={styles.badge(product.badge)}>{product.badge}</div>
      )}
      <div style={styles.imagePlaceholder}>Image placeholder</div>
      <div style={styles.cardBody}>
        <div style={styles.cardName}>{product.name}</div>
        <Stars rating={product.rating} />
        <div style={styles.cardPrice}>${product.price.toFixed(2)}</div>
        <div style={styles.btnGroup}>
          <button style={styles.btnCart}>Add to Cart</button>
          {buyNow && <button style={styles.btnBuy}>Buy Now</button>}
        </div>
      </div>
    </div>
  );
}

function ProductRow({ product, buyNow }) {
  return (
    <div style={styles.listRow}>
      <div>
        <span style={styles.listName}>{product.name}</span>
        <span style={styles.listPrice}>${product.price.toFixed(2)}</span>
      </div>
      <div style={{ display: "flex", gap: 8 }}>
        <button style={styles.btnCart}>Add to Cart</button>
        {buyNow && <button style={styles.btnBuy}>Buy Now</button>}
      </div>
    </div>
  );
}

export default function App() {
  const [flags, setFlags] = useState({});
  const [status, setStatus] = useState("live");

  useEffect(() => {
    fetchFlags();
    const interval = setInterval(fetchFlags, 5000);
    return () => clearInterval(interval);
  }, []);

  async function fetchFlags() {
    try {
      const res = await api.get("/flags");
      const map = {};
      res.data.flags.forEach(f => { map[f.flagName] = f.enabled; });
      setFlags(map);
      setStatus("live");
    } catch (err) {
      console.error("Failed to fetch flags", err);
      setStatus("offline");
    }
  }

  const promoBanner = flags["promo-banner"];
  const richLayout = flags["new-product-layout"];
  const buyNow = flags["buy-now-button"];
  const showRecommended = flags["recommended-products"];

  return (
    <div style={styles.page}>
      {promoBanner && (
        <div style={styles.promoBanner}>
          Summer Sale — 20% off everything 🎉
        </div>
      )}

      <header style={styles.header}>
        <h1 style={styles.headerTitle}>Store</h1>
        <nav style={styles.nav}>
          <span>Home</span>
          <span>Products</span>
          <span>About</span>
          <span>Cart (0)</span>
        </nav>
      </header>

      <main style={styles.main}>
        <h2 style={styles.sectionTitle}>Products</h2>

        {richLayout ? (
          <div style={styles.grid}>
            {PRODUCTS.map(p => (
              <ProductCard key={p.id} product={p} buyNow={buyNow} />
            ))}
          </div>
        ) : (
          <div style={styles.list}>
            {PRODUCTS.map(p => (
              <ProductRow key={p.id} product={p} buyNow={buyNow} />
            ))}
          </div>
        )}

        {showRecommended && (
          <>
            <hr style={styles.divider} />
            <h2 style={styles.sectionTitle}>You might also like</h2>
            <div style={styles.grid}>
              {RECOMMENDED.map(p => (
                <div key={p.id} style={styles.card}>
                  <div style={styles.imagePlaceholder}>Image placeholder</div>
                  <div style={styles.cardBody}>
                    <div style={styles.cardName}>{p.name}</div>
                    <div style={styles.cardPrice}>${p.price.toFixed(2)}</div>
                    <button style={{ ...styles.btnCart, width: "100%", marginTop: 8 }}>
                      Add to Cart
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </main>

      <footer style={styles.footer}>
        <span style={{
          display: "inline-flex",
          alignItems: "center",
          gap: 6,
        }}>
          <span style={{
            width: 8,
            height: 8,
            borderRadius: "50%",
            background: status === "live" ? "#1a7f37" : "#9aa3b2",
            display: "inline-block",
            boxShadow: status === "live" ? "0 0 0 2px #d4f5de" : "none",
            animation: status === "live" ? "pulse 2s infinite" : "none",
          }} />
          <span style={{ color: status === "live" ? "#1a7f37" : "#9aa3b2" }}>
            {status === "live" ? "Live" : "Offline"}
          </span>
          <span style={{ color: "#c0c7d4", marginLeft: 8 }}>
            · Polling every 5s · Last updated: {new Date().toLocaleTimeString()}
          </span>
        </span>
      </footer>
    </div>
  );
}