import { useState, useEffect } from "react";
import BugTable from "./BugTable";
import "./BugForm.css";

const STATUS_MESSAGES = {
  trying_primary: "Trying Gemini 2.5 Flash...",
  retrying_primary: "Retrying Gemini 2.5 Flash...",
  switching: "Switching to backup model...",
  trying_fallback: "Trying Gemini 2.0 Flash...",
  generating: "Generating report...",
};

export default function BugForm() {
  const [description, setDescription] = useState("");
  const [allBugs, setAllBugs] = useState([]);
  const [filterSeverity, setFilterSeverity] = useState("");
  const [filterBugType, setFilterBugType] = useState("");

  const [popup, setPopup] = useState(null);
  // popup = null | { type: "loading", message: string } | { type: "error", message: string }

  const fetchAllBugs = async () => {
    const query = new URLSearchParams();
    if (filterSeverity) query.append("severity", filterSeverity);
    if (filterBugType) query.append("bugType", filterBugType);
    const res = await fetch(`http://localhost:8000/bugs?${query}`);
    const data = await res.json();
    setAllBugs(data);
  };

  useEffect(() => {
    fetchAllBugs();
  }, [filterSeverity, filterBugType]);

  const generateReport = async () => {
    if (!description.trim()) return;

    setPopup({ type: "loading", message: STATUS_MESSAGES.trying_primary });

    try {
      const res = await fetch("http://localhost:8000/generate-bug", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ description }),
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.detail || "Something went wrong");
      }

      setDescription("");
      setPopup(null);
      fetchAllBugs();

    } catch (err) {
      const is503 = err.message?.toLowerCase().includes("unavailable")
        || err.message?.includes("503");

      setPopup({
        type: "error",
        message: is503
          ? "AI models are currently busy. Please try again in a moment."
          : `Unexpected error:`,
      });
    }
  };

  const updateBug = async (bugId, updatedFields) => {
    await fetch(`http://localhost:8000/bugs/${bugId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(updatedFields),
    });
    fetchAllBugs();
  };

  return (
    <div style={{ margin: "2rem auto" }} className="bodyForm">

      {/* ── Popup overlay ── */}
      {popup && (
        <div style={{
          position: "fixed", inset: 0,
          background: "rgba(0,0,0,0.45)",
          display: "flex", alignItems: "center", justifyContent: "center",
          zIndex: 1000,
        }}>
          <div style={{
            background: "var(--color-background-primary, #fff)",
            border: "0.5px solid var(--color-border-tertiary, #e0e0e0)",
            borderRadius: "12px",
            padding: "2rem 2.25rem",
            width: "300px",
            textAlign: "center",
          }}>

            {popup.type === "loading" && (
              <>
                <div style={{
                  display: "flex", alignItems: "center",
                  justifyContent: "center", gap: "10px",
                  marginBottom: "8px",
                }}>
                  <div style={{
                    width: "18px", height: "18px", flexShrink: 0,
                    border: "2.5px solid #e0e0e0",
                    borderTopColor: "#1a73e8",
                    borderRadius: "50%",
                    animation: "bugSpin 0.8s linear infinite",
                  }} />
                  <span style={{ fontSize: "15px", fontWeight: 500 }}>
                    Generating report...
                  </span>
                </div>
                <p style={{
                  fontSize: "13px",
                  color: "var(--color-text-secondary, #666)",
                  margin: 0,
                }}>
                  {popup.message}
                </p>
              </>
            )}

            {popup.type === "error" && (
              <>
                <div style={{
                  width: "36px", height: "36px",
                  borderRadius: "50%",
                  background: "var(--color-background-danger, #fdecea)",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  margin: "0 auto 12px",
                  fontSize: "18px",
                  color: "var(--color-text-danger, #c62828)",
                }}>
                  !
                </div>
                <p style={{ fontSize: "15px", fontWeight: 500, margin: "0 0 6px" }}>
                  Could not generate report
                </p>
                <p style={{
                  fontSize: "13px",
                  color: "var(--color-text-secondary, #666)",
                  margin: "0 0 18px",
                }}>
                  {popup.message}
                </p>
                <button onClick={() => setPopup(null)}>
                  Close
                </button>
              </>
            )}

          </div>
        </div>
      )}

      {/* ── Spinner keyframes ── */}
      <style>{`@keyframes bugSpin { to { transform: rotate(360deg); } }`}</style>

      {/* ── Form ── */}
      <div className="form">
        <label htmlFor="description">
          QA Bug Assistant 🐞 — Let's Hunt This Bug
        </label>
        <textarea
          id="description"
          rows={5}
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Describe the bug..."
          style={{ width: "100%", marginBottom: "1rem" }}
          required
        />
        <button onClick={generateReport} disabled={!!popup}>
          Generate Bug
        </button>
      </div>

      <h3 style={{ marginTop: "2rem" }}>Filters</h3>
      <div className="filters">
        <select onChange={(e) => setFilterSeverity(e.target.value)} className="btn-sev">
          <option value="">All Severities</option>
          <option value="Critical">Critical</option>
          <option value="High">High</option>
          <option value="Medium">Medium</option>
          <option value="Low">Low</option>
        </select>
        <select onChange={(e) => setFilterBugType(e.target.value)} className="btn-sev">
          <option value="">All Bug Types</option>
          <option value="Functional">Functional</option>
          <option value="Visual">Visual</option>
          <option value="Content">Content</option>
        </select>
      </div>

      <BugTable bugs={allBugs} onUpdate={updateBug} />
    </div>
  );
}