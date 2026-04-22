import { Link, useParams } from 'react-router-dom';
import { useEffect, useState } from 'react';
import LoadingBottle from './LoadingBottle';
import "./BugEdit.css"
const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000';


function BugEdit() {
   const { id } = useParams();
    const [bug, setBug] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [editedBugs, setEditedBugs] = useState({});

    useEffect(() => {
      const fetchBug = async () => {
        try {
          setLoading(true);
          setError(null);
          
          console.log(`Fetching bug from: ${API_BASE_URL}/bugs/${id}`);
          
          const response = await fetch(`${API_BASE_URL}/bugs/${id}`);
          
          if (!response.ok) {
            const errorText = await response.text();
            console.error('Error response:', errorText);
            throw new Error(`Failed to fetch bug: ${response.status} ${response.statusText}`);
          }
          
          const data = await response.json();
          console.log('Bug data received:', data);
          setBug(data);
        } catch (err) {
          console.error('Fetch error:', err);
          setError(err.message);
        } finally {
          setLoading(false);
        }
      };
  
      if (id) {
        fetchBug();
      } else {
        setError('No bug ID provided');
        setLoading(false);
      }
    }, [id]);
  
    // Use the custom loading component
    if (loading) return <LoadingBottle />;
    
    if (error) return (
      <div className="error-container">
        <p>Error: {error}</p>
        <button onClick={() => window.location.reload()}>Retry</button>
      </div>
    );
    
    if (!bug) return <p>Bug not found</p>;
  const handleChange = (bugId, field, value) => {
  setEditedBugs((prev) => ({
    ...prev,
    [bugId]: {
      ...prev[bugId],
      [field]: value,
    },
  }));
};

const handleSave = async () => {
  const updates = editedBugs[bug._id];
  if (!updates) return; // nothing changed

  try {
    const response = await fetch(`${API_BASE_URL}/bugs/${bug._id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...updates, human_edited: true }), // AI flag
    });

    if (!response.ok) throw new Error("Failed to save bug");

    const updatedBug = await response.json();
    setBug(updatedBug);        // update local state with latest bug
    setEditedBugs({});          // clear local edits
    alert("Bug saved successfully!");
  } catch (err) {
    console.error(err);
    alert("Error saving bug: " + err.message);
  }
};



  return (
<div className="bug-detail">
      <div className="bug-detail-card">

  <h2>Edited Bug</h2>

  <label>
    Title:
    <input
      type="text"
      value={editedBugs[bug._id]?.title || bug.title || ""}
      onChange={(e) => handleChange(bug._id, "title", e.target.value)}
    />
  </label>

  <label>
    Severity:
    <input
      type="text"
      value={editedBugs[bug._id]?.severity || bug.severity || ""}
      onChange={(e) => handleChange(bug._id, "severity", e.target.value)}
    />
  </label>

  <label>
    Priority:
    <input
      type="text"
      value={editedBugs[bug._id]?.priority || bug.priority || ""}
      onChange={(e) => handleChange(bug._id, "priority", e.target.value)}
    />
  </label>

  <label>
    Status:
    <input
      type="text"
      value={editedBugs[bug._id]?.status || bug.status || ""}
      onChange={(e) => handleChange(bug._id, "status", e.target.value)}
    />
  </label>

  <label>
    Bug Type:
    <input
      type="text"
      value={editedBugs[bug._id]?.bugType || bug.bugType || ""}
      onChange={(e) => handleChange(bug._id, "bugType", e.target.value)}
    />
  </label>

  <label>
    Description:
    <textarea
      value={editedBugs[bug._id]?.component || bug.component || ""}
      onChange={(e) => handleChange(bug._id, "component", e.target.value)}
    />
  </label>

  <label>
    Actual Result:
    <textarea
      value={editedBugs[bug._id]?.actual_result || bug.actual_result || ""}
      onChange={(e) => handleChange(bug._id, "actual_result", e.target.value)}
    />
  </label>

  <label>
    Expected Result:
    <textarea
      value={editedBugs[bug._id]?.expected_result || bug.expected_result || ""}
      onChange={(e) => handleChange(bug._id, "expected_result", e.target.value)}
    />
  </label>

  <label>
    Labels:
    <input
      type="text"
      value={editedBugs[bug._id]?.labels || bug.labels || ""}
      onChange={(e) => handleChange(bug._id, "labels", e.target.value)}
    />
  </label>

<button onClick={handleSave}>Save</button></div></div>
  );
}


export default BugEdit;
