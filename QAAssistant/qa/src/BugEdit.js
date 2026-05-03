import { Link, useParams } from 'react-router-dom';
import { useEffect, useState } from 'react';
import LoadingBottle from './LoadingBottle';
import "./BugEdit.css"
import { useNavigate } from 'react-router-dom';
const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000';

function BugEdit() {
  const { id } = useParams();
  const [bug, setBug] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [editedBugs, setEditedBugs] = useState({});
const navigate = useNavigate()
  // screenshot states
  const [screenshots, setScreenshots] = useState([]);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    const fetchBug = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await fetch(`${API_BASE_URL}/bugs/${id}`);
        if (!response.ok) throw new Error(`Failed to fetch bug: ${response.status}`);
        const data = await response.json();
        setBug(data);
        // load existing screenshots if any
        setScreenshots(data.screenshots || []);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    if (id) fetchBug();
    else { setError('No bug ID provided'); setLoading(false); }
  }, [id]);

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
      [bugId]: { ...prev[bugId], [field]: value },
    }));
  };

  // called when user picks a file
  const handleScreenshotUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // only allow images
    if (!file.type.startsWith("image/")) {
      alert("Only image files are allowed");
      return;
    }

    setUploading(true);
    try {
      const formData = new FormData();
      formData.append("file", file);

      const response = await fetch(`${API_BASE_URL}/upload-screenshot`, {
        method: "POST",
        body: formData, // no Content-Type header, browser sets it automatically for FormData
      });

      if (!response.ok) throw new Error("Upload failed");

      const data = await response.json();
      // add the returned Cloudinary URL to our list
      setScreenshots((prev) => [...prev, data.url]);
    } catch (err) {
      alert("Screenshot upload failed: " + err.message);
    } finally {
      setUploading(false);
    }
  };

  // remove a screenshot from the list
  const handleRemoveScreenshot = (urlToRemove) => {
    setScreenshots((prev) => prev.filter((url) => url !== urlToRemove));
  };

  const handleSave = async () => {
    const updates = editedBugs[bug._id] || {};

    // always include screenshots in the save
    updates.screenshots = screenshots;
    updates.human_edited = true;

    try {
      const response = await fetch(`${API_BASE_URL}/bugs/${bug._id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updates),
      });

      if (!response.ok) throw new Error("Failed to save bug");

      const result = await response.json();

      if (result.trello) {
        alert(`Bug saved! Trello card: ${result.trello}`);
      } else {
        alert("Bug saved successfully!");
        navigate('/')
      }

      setEditedBugs({});
    } catch (err) {
      alert("Error saving bug: " + err.message);
    }
  };

  return (
    <div className="bug-detail">
      <div className="bug-detail-card">
        <h2>Edit Bug</h2>

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
          <select
            value={editedBugs[bug._id]?.status || bug.status || "Open"}
            onChange={(e) => handleChange(bug._id, "status", e.target.value)}
          >
            <option value="Open">Open</option>
            <option value="In Progress">In Progress</option>
            <option value="Closed">Closed</option>
          </select>
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

        {/* ---- SCREENSHOT SECTION ---- */}
        <div className="screenshot-section">
          <label>Screenshots:</label>

          {/* existing + newly uploaded screenshots */}
          {screenshots.length > 0 && (
            <div className="screenshot-preview">
              {screenshots.map((url, index) => (
                <div key={index} className="screenshot-item">
                  <img src={url} alt={`screenshot-${index}`} />
                <button
  type="button"
  className="remove-screenshot"
  onClick={() => handleRemoveScreenshot(url)}
  title="Remove screenshot"
>
  ✕
</button>
                </div>
              ))}
            </div>
          )}

          {/* upload button */}
          <label className="upload-btn">
            {uploading ? "Uploading..." : "＋ Add Screenshot"}
            <input
              type="file"
              accept="image/*"
              onChange={handleScreenshotUpload}
              disabled={uploading}
              style={{ display: "none" }}
            />
          </label>
        </div>
        {/* ---- END SCREENSHOT SECTION ---- */}

        <button onClick={() =>handleSave()}>Save</button>
      </div>
    </div>
  );
}

export default BugEdit;