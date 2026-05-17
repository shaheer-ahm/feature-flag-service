import { useState, useEffect } from "react";
import axios from "axios";

const API_URL = import.meta.env.VITE_API_URL;
const API_KEY = import.meta.env.VITE_API_KEY;

const api = axios.create({
  baseURL: API_URL,
  headers: { "x-api-key": API_KEY },
});

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
  headerSub: {
    fontSize: 13,
    color: "#8899bb",
  },
  main: {
    maxWidth: 720,
    margin: "0 auto",
    padding: "36px 20px",
  },
  card: {
    background: "#fff",
    borderRadius: 10,
    border: "1px solid #e4e7ec",
    marginBottom: 10,
    overflow: "hidden",
    boxShadow: "0 1px 3px rgba(0,0,0,0.04)",
  },
  cardRow: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    padding: "14px 20px",
  },
  flagName: {
    fontWeight: 600,
    fontSize: 15,
    color: "#0f1f3d",
  },
  badge: (enabled) => ({
    marginLeft: 10,
    padding: "2px 10px",
    borderRadius: 20,
    fontSize: 11,
    fontWeight: 600,
    letterSpacing: 0.4,
    background: enabled ? "#e6f4ea" : "#fce8e8",
    color: enabled ? "#1a7f37" : "#c0392b",
  }),
  meta: {
    fontSize: 11,
    color: "#9aa3b2",
    marginTop: 4,
  },
  btnGroup: {
    display: "flex",
    gap: 8,
  },
  btn: {
    padding: "7px 14px",
    borderRadius: 6,
    border: "1px solid #d1d5db",
    background: "#fff",
    cursor: "pointer",
    fontSize: 13,
    color: "#374151",
    fontFamily: "inherit",
  },
  btnPrimary: (enabled) => ({
    padding: "7px 14px",
    borderRadius: 6,
    border: "none",
    background: enabled ? "#374151" : "#0f1f3d",
    color: "#fff",
    cursor: "pointer",
    fontSize: 13,
    fontFamily: "inherit",
  }),
  btnDanger: {
    padding: "7px 14px",
    borderRadius: 6,
    border: "1px solid #fca5a5",
    background: "#fff",
    color: "#c0392b",
    cursor: "pointer",
    fontSize: 13,
    fontFamily: "inherit",
  },
  auditPanel: {
    background: "#f8f9fb",
    borderTop: "1px solid #e4e7ec",
    padding: "12px 20px",
  },
  auditEntry: (i, total) => ({
    fontSize: 13,
    color: "#444",
    padding: "7px 0",
    borderBottom: i < total - 1 ? "1px solid #eef0f3" : "none",
    display: "flex",
    alignItems: "center",
    gap: 12,
  }),
  auditBadge: (value) => ({
    display: "inline-block",
    width: 64,
    fontWeight: 600,
    fontSize: 11,
    padding: "2px 8px",
    borderRadius: 20,
    background: value ? "#e6f4ea" : "#fce8e8",
    color: value ? "#1a7f37" : "#c0392b",
    textAlign: "center",
  }),
  createRow: {
    display: "flex",
    gap: 10,
    marginBottom: 28,
  },
  input: {
    flex: 1,
    padding: "9px 14px",
    fontSize: 14,
    border: "1px solid #d1d5db",
    borderRadius: 6,
    fontFamily: "inherit",
    outline: "none",
  },
};

export default function App() {
  const [flags, setFlags] = useState([]);
  const [newFlagName, setNewFlagName] = useState("");
  const [newFlagDesc, setNewFlagDesc] = useState("");
  const [error, setError] = useState(null);
  const [auditLogs, setAuditLogs] = useState({});
  const [expandedFlag, setExpandedFlag] = useState(null);
  const [search, setSearch] = useState("");
  const [confirmDelete, setConfirmDelete] = useState(null);

  useEffect(() => { fetchFlags(); }, []);

  async function fetchFlags() {
    try {
      const res = await api.get("/flags");
      setFlags(res.data.flags.sort((a, b) => a.flagName.localeCompare(b.flagName)));
    } catch {
      setError("Failed to load flags");
    }
  }

  async function createFlag() {
    if (!newFlagName.trim()) return;
    try {
      await api.post("/flags", { flagName: newFlagName, description: newFlagDesc, enabled: false });
      setNewFlagName("");
      setNewFlagDesc("");
      fetchFlags();
    } catch {
      setError("Failed to create flag");
    }
  }

  async function toggleFlag(flagName, currentValue) {
    try {
      await api.put(`/flags/${flagName}`, { enabled: !currentValue });
      fetchFlags();
    } catch {
      setError("Failed to toggle flag");
    }
  }

  async function updateRollout(flagName, enabled, percentage) {
    try {
      await api.put(`/flags/${flagName}`, { enabled, rolloutPercentage: percentage });
      fetchFlags();
    } catch {
      setError("Failed to update rollout");
    }
  }

  async function deleteFlag(flagName) {
    try {
      await api.delete(`/flags/${flagName}`);
      if (expandedFlag === flagName) setExpandedFlag(null);
      fetchFlags();
    } catch {
      setError("Failed to delete flag");
    }
  }

  async function toggleAuditLog(flagName) {
    if (expandedFlag === flagName) {
      setExpandedFlag(null);
      return;
    }
    try {
      const res = await api.get(`/flags/${flagName}/audit`);
      setAuditLogs(prev => ({ ...prev, [flagName]: res.data.history }));
      setExpandedFlag(flagName);
    } catch {
      setError("Failed to load audit log");
    }
  }

  return (
    <div style={styles.page}>
      <header style={styles.header}>
        <h1 style={styles.headerTitle}>Feature Flag Admin</h1>
        <span style={styles.headerSub}>{flags.length} flag{flags.length !== 1 ? "s" : ""}</span>
      </header>

      <main style={styles.main}>
        {error && (
          <div style={{ background: "#fce8e8", color: "#c0392b", padding: "10px 16px", borderRadius: 6, marginBottom: 20, fontSize: 13 }}>
            {error}
          </div>
        )}

        <div style={{ marginBottom: 28 }}>
          <div style={styles.createRow}>
            <input
              style={styles.input}
              type="text"
              placeholder="Flag name"
              value={newFlagName}
              onChange={e => setNewFlagName(e.target.value)}
              onKeyDown={e => e.key === "Enter" && createFlag()}
            />
            <input
              style={styles.input}
              type="text"
              placeholder="Description (optional)"
              value={newFlagDesc}
              onChange={e => setNewFlagDesc(e.target.value)}
              onKeyDown={e => e.key === "Enter" && createFlag()}
            />
            <button style={styles.btnPrimary(false)} onClick={createFlag}>
              Create flag
            </button>
          </div>
        </div>
        <input
          style={{ ...styles.input, marginBottom: 20, width: "100%", boxSizing: "border-box" }}
          type="text"
          placeholder="Search flags..."
          value={search}
          onChange={e => setSearch(e.target.value)}
        />

        {flags.length === 0 && (
          <p style={{ color: "#9aa3b2", fontSize: 14 }}>No flags yet. Create one above.</p>
        )}

        {flags.filter(f => f.flagName.toLowerCase().includes(search.toLowerCase())).map(flag => (
          <div key={flag.flagName} style={styles.card}>
            <div style={styles.cardRow}>
              <div>
                <span style={styles.flagName}>{flag.flagName}</span>
                <span style={styles.badge(flag.enabled)}>
                  {flag.enabled ? "enabled" : "disabled"}
                </span>
                {flag.description && (
                  <div style={{ fontSize: 13, color: "#555", marginTop: 4 }}>
                    {flag.description}
                  </div>
                )}
                <div style={styles.meta}>
                  Last updated: {new Date(flag.updatedAt).toLocaleString()}
                </div>
              </div>
              <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 8 }}>
                <div style={styles.btnGroup}>
                  <button style={styles.btn} onClick={() => toggleAuditLog(flag.flagName)}>
                    {expandedFlag === flag.flagName ? "Hide history" : "History"}
                  </button>
                  <button style={styles.btnPrimary(flag.enabled)} onClick={() => toggleFlag(flag.flagName, flag.enabled)}>
                    {flag.enabled ? "Disable" : "Enable"}
                  </button>
                  {confirmDelete === flag.flagName ? (
                    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                      <span style={{ fontSize: 12, color: "#c0392b" }}>Are you sure?</span>
                      <button style={{ ...styles.btnDanger, padding: "7px 10px" }} onClick={() => {
                        deleteFlag(flag.flagName);
                        setConfirmDelete(null);
                      }}>
                        Yes
                      </button>
                      <button style={{ ...styles.btn, padding: "7px 10px" }} onClick={() => setConfirmDelete(null)}>
                        No
                      </button>
                    </div>
                  ) : (
                    <button style={styles.btnDanger} onClick={() => setConfirmDelete(flag.flagName)}>
                      Delete
                    </button>
                  )}
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <label style={{ fontSize: 12, color: "#9aa3b2" }}>Rollout</label>
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={flag.rolloutPercentage}
                    onChange={e => updateRollout(flag.flagName, flag.enabled, parseInt(e.target.value))}
                    style={{ width: 100 }}
                  />
                  <span style={{ fontSize: 12, color: "#374151", width: 36 }}>{flag.rolloutPercentage}%</span>
                </div>
              </div>
            </div>

            {expandedFlag === flag.flagName && (
              <div style={styles.auditPanel}>
                {!auditLogs[flag.flagName]?.length && (
                  <p style={{ fontSize: 13, color: "#9aa3b2", margin: 0 }}>No history yet.</p>
                )}
                {auditLogs[flag.flagName]?.map((entry, i) => (
                  <div key={i} style={styles.auditEntry(i, auditLogs[flag.flagName].length)}>
                    <span style={styles.auditBadge(entry.newValue)}>
                      {entry.newValue ? "enabled" : "disabled"}
                    </span>
                    <span style={{ color: "#9aa3b2" }}>
                      {new Date(entry.changedAt).toLocaleString()}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        ))}
      </main>
    </div>
  );
}