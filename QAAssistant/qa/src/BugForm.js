import { useState, useEffect } from "react";
import BugTable from "./BugTable";
import "./BugForm.css"
export default function BugForm() {
  const [description, setDescription] = useState("");
  const [allBugs, setAllBugs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [filterSeverity, setFilterSeverity] = useState("");
  const [filterBugType, setFilterBugType] = useState("");

  // fetch bugs
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

  // CREATE bug (AI)
  const generateReport = async () => {
    if (!description.trim()) return;
    setLoading(true);
    await fetch("http://localhost:8000/generate-bug", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ description }),
    });
    setDescription("");
    setLoading(false);
    fetchAllBugs();
  };

  // ✅ UPDATE STATUS (THIS WAS MISSING)
const updateBug = async (bugId, updatedFields) => {
  await fetch(`http://localhost:8000/bugs/${bugId}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(updatedFields),
  });

  fetchAllBugs(); // refresh from DB (source of truth)
};

  return (
    <div style={{  margin: "2rem auto" }} className="bodyForm">
    

<div className="form">
  <label htmlFor="description">
    QA Bug Assistant 🐞
Let's Hunt This Bug   </label>

  <textarea
    id="description"
    rows={5}
    value={description}
    onChange={(e) => setDescription(e.target.value)}
    placeholder="Describe the bug..."
    style={{ width: "100%", marginBottom: "1rem" }}
    required
  />

  <button onClick={generateReport} disabled={loading}>
    {loading ? "Generating..." : "Generate Bug"}
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
