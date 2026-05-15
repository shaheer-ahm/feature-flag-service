import { useState, useEffect } from "react";
import axios from "axios";

const API_URL = import.meta.env.VITE_API_URL;
const API_KEY = import.meta.env.VITE_API_KEY;

const api = axios.create({
  baseURL: API_URL,
  headers: { "x-api-key": API_KEY },
});

export default function App() {
  const [flags, setFlags] = useState([]);
  const [newFlagName, setNewFlagName] = useState("");
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchFlags();
  }, []);

  async function fetchFlags() {
    try {
      const res = await api.get("/flags");
      setFlags(res.data.flags);
    } catch (err) {
      setError("Failed to load flags");
    }
  }

  async function createFlag() {
    if (!newFlagName.trim()) return;
    try {
      await api.post("/flags", { flagName: newFlagName, enabled: false });
      setNewFlagName("");
      fetchFlags();
    } catch (err) {
      setError("Failed to create flag");
    }
  }

  async function toggleFlag(flagName, currentValue) {
    try {
      await api.put(`/flags/${flagName}`, { enabled: !currentValue });
      fetchFlags();
    } catch (err) {
      setError("Failed to toggle flag");
    }
  }

  async function deleteFlag(flagName) {
    try {
      await api.delete(`/flags/${flagName}`);
      fetchFlags();
    } catch (err) {
      setError("Failed to delete flag");
    }
  }

  return (
    <div style={{ maxWidth: 600, margin: "40px auto", fontFamily: "sans-serif", padding: "0 20px" }}>
      <h1>Feature Flags</h1>

      {error && <p style={{ color: "red" }}>{error}</p>}

      <div style={{ display: "flex", gap: 8, marginBottom: 32 }}>
        <input
          type="text"
          placeholder="Flag name"
          value={newFlagName}
          onChange={e => setNewFlagName(e.target.value)}
          style={{ flex: 1, padding: "8px 12px", fontSize: 14 }}
        />
        <button onClick={createFlag} style={{ padding: "8px 16px" }}>
          Create
        </button>
      </div>

      {flags.length === 0 && <p>No flags yet.</p>}

      {flags.map(flag => (
        <div key={flag.flagName} style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "12px 16px",
          marginBottom: 8,
          border: "1px solid #ddd",
          borderRadius: 6,
        }}>
          <div>
            <strong>{flag.flagName}</strong>
            <span style={{
              marginLeft: 12,
              padding: "2px 8px",
              borderRadius: 12,
              fontSize: 12,
              background: flag.enabled ? "#d4edda" : "#f8d7da",
              color: flag.enabled ? "#155724" : "#721c24",
            }}>
              {flag.enabled ? "enabled" : "disabled"}
            </span>
          </div>
          <div style={{ display: "flex", gap: 8 }}>
            <button onClick={() => toggleFlag(flag.flagName, flag.enabled)}>
              {flag.enabled ? "Disable" : "Enable"}
            </button>
            <button onClick={() => deleteFlag(flag.flagName)} style={{ color: "red" }}>
              Delete
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}