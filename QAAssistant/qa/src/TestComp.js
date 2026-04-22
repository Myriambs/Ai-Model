import React, { useState } from 'react';
import './App.css'; // Link to the CSS below

const MainComponent = () => {
  const [description, setDescription] = useState('');
  const [items, setItems] = useState([
    { id: 1, title: 'Issue 1', status: 'Open', severity: 'High' },
    { id: 2, title: 'Issue 2', status: 'In Progress', severity: 'Medium' },
    { id: 3, title: 'Issue 3', status: 'Closed', severity: 'Low' }
  ]);
  const [editingId, setEditingId] = useState(null);
  const [editTitle, setEditTitle] = useState('');
  const [editStatus, setEditStatus] = useState('');
  const [editSeverity, setEditSeverity] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (description.trim()) {
      const newItem = {
        id: Date.now(),
        title: description.slice(0, 50) + '...',
        status: 'Open',
        severity: 'Medium'
      };
      setItems([newItem, ...items]);
      setDescription('');
    }
  };

  const handleView = (id) => {
    alert(`Viewing item ${id}`); // Replace with your display by ID logic
  };

  const handleEdit = (item) => {
    setEditingId(item.id);
    setEditTitle(item.title);
    setEditStatus(item.status);
    setEditSeverity(item.severity);
  };

  const handleSave = (id) => {
    setItems(items.map(item =>
      item.id === id
        ? { ...item, title: editTitle, status: editStatus, severity: editSeverity }
        : item
    ));
    setEditingId(null);
  };

  const handleCancel = () => {
    setEditingId(null);
  };

  return (
    <div className="container">
      <form onSubmit={handleSubmit} className="input-section">
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Enter description..."
          rows="4"
          maxLength="500"
        />
        <button type="submit">Submit</button>
      </form>

      <table className="data-table">
        <thead>
          <tr>
            <th>Title</th>
            <th>Status</th>
            <th>Severity</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {items.map((item) => (
            <tr key={item.id}>
              <td>
                {editingId === item.id ? (
                  <input
                    value={editTitle}
                    onChange={(e) => setEditTitle(e.target.value)}
                  />
                ) : (
                  <span onClick={() => handleView(item.id)} className="clickable">
                    {item.title}
                  </span>
                )}
              </td>
              <td>{editingId === item.id ? (
                <select value={editStatus} onChange={(e) => setEditStatus(e.target.value)}>
                  <option>Open</option>
                  <option>In Progress</option>
                  <option>Closed</option>
                </select>
              ) : item.status}</td>
              <td>{editingId === item.id ? (
                <select value={editSeverity} onChange={(e) => setEditSeverity(e.target.value)}>
                  <option>Low</option>
                  <option>Medium</option>
                  <option>High</option>
                </select>
              ) : item.severity}</td>
              <td className="actions">
                {editingId === item.id ? (
                  <>
                    <button onClick={() => handleSave(item.id)}>Save</button>
                    <button onClick={handleCancel}>Cancel</button>
                  </>
                ) : (
                  <>
                    <button onClick={() => handleView(item.id)}>View</button>
                    <button onClick={() => handleEdit(item.id)}>Edit</button>
                  </>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default MainComponent;