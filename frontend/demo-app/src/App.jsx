import { useState, useEffect } from "react";
import axios from "axios";

const API_URL = import.meta.env.VITE_API_URL;
const API_KEY = import.meta.env.VITE_API_KEY;

const api = axios.create({
  baseURL: API_URL,
  headers: { "x-api-key": API_KEY },
});

export default function App() {
  const [flags, setFlags] = useState({});

  useEffect(() => {
    fetchFlags();
    const interval = setInterval(fetchFlags, 5000);
    return () => clearInterval(interval);
  }, []);

  async function fetchFlags() {
    try {
      const res = await api.get("/flags");
      const flagMap = {};
      res.data.flags.forEach(f => {
        flagMap[f.flagName] = f.enabled;
      });
      setFlags(flagMap);
    } catch (err) {
      console.error("Failed to fetch flags", err);
    }
  }

  return (
    <div style={{ maxWidth: 600, margin: "40px auto", fontFamily: "sans-serif", padding: "0 20px" }}>
      <h1>Demo App</h1>
      <p style={{ color: "#666", marginBottom: 32 }}>
        This app polls the feature flag API every 5 seconds and updates automatically.
      </p>

      {flags["dark-mode"] && (
        <div style={{
          background: "#1a1a2e",
          color: "#eee",
          padding: "16px 20px",
          borderRadius: 8,
          marginBottom: 16,
        }}>
          🌙 Dark mode is enabled
        </div>
      )}

      {flags["new-checkout"] && (
        <div style={{
          background: "#d4edda",
          color: "#155724",
          padding: "16px 20px",
          borderRadius: 8,
          marginBottom: 16,
        }}>
          🛒 New checkout experience is live
        </div>
      )}

      {flags["beta-ui"] && (
        <div style={{
          background: "#cce5ff",
          color: "#004085",
          padding: "16px 20px",
          borderRadius: 8,
          marginBottom: 16,
        }}>
          🧪 Beta UI is active
        </div>
      )}

      <div style={{ marginTop: 32, fontSize: 12, color: "#999" }}>
        Last updated: {new Date().toLocaleTimeString()}
      </div>
    </div>
  );
}