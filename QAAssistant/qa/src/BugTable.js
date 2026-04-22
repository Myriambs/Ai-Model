import { useState } from "react";
import "./BugTable.css"
import { Link } from "react-router-dom";
export default function BugTable({ bugs = [], onUpdate }) {
  const [editedBugs, setEditedBugs] = useState({});
//ici la partie ou on montre la severity and status , what is whas and how it will be 
  const handleChange = (bugId, field, value) => {
    setEditedBugs((prev) => ({
      ...prev,
      [bugId]: {
        ...prev[bugId],
        [field]: value,
      },
    }));
  };

const handleSave = (bug) => {
  const updates = editedBugs[bug._id];
  if (!updates) return;

  // 👉 confirm BEFORE sending
  if (bug.status === "Closed" && updates.status && updates.status !== "Closed") {
    if (!window.confirm("You are reopening this bug. Continue?")) return;
  }

  onUpdate(bug._id, updates);
};

  return (
   <div className="container">
  <h2>Bug List</h2>

  <ul className="responsive-table">
    {/* HEADER */}
    <li className="table-header">
      <div className="col col-1">Title</div>
      <div className="col col-2">Severity</div>
      <div className="col col-3">Status</div>
      <div className="col col-4">Save</div>
    </li>

    {/* EMPTY STATE */}
    {bugs.length === 0 ? (
      <li className="table-row">
        <div className="col col-1">No bugs found</div>
      </li>
    ) : (
      bugs.map((bug) => (
        <li key={bug._id} className="table-row">
          <div className="col col-1" data-label="Title">
       <Link to={`/bug/${bug._id}`} title={bug.title}  >
    {bug.title.split(" ").slice(0, 3).join(" ")}
    {bug.title.split(" ").length > 3 ? "..." : ""}
  </Link>
          </div>



          <div className="col col-2" data-label="Severity">
            <select
           value={editedBugs[bug._id]?.severity || bug.severity}
    onChange={(e) => handleChange(bug._id, "severity", e.target.value)}
            >
              <option>Critical</option>
              <option>High</option>
              <option>Medium</option>
              <option>Low</option>
            </select>
          </div>

          <div className="col col-3" data-label="Status">
            <select
            value={editedBugs[bug._id]?.status || bug.status}
    onChange={(e) => handleChange(bug._id, "status", e.target.value)}
            >
              <option>Open</option>
              <option>In Progress</option>
              <option>Closed</option>
            </select>


            <div className="col col-4" data-label="Save">
  <button onClick={() => handleSave(bug)}>Save</button>
  </div>
            <div className="col col-4" >

{bug.human_edited ? (
  <span className="badge human">✏️ Human Edited</span>
) : (
  <span className="badge ai">🤖 AI Generated</span>
)}


</div>
          </div>
        </li>
      ))
    )}
  </ul>
</div>
  );
}
