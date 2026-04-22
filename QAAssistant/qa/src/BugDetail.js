import { Link, useParams } from 'react-router-dom';
import { useEffect, useState } from 'react';
import LoadingBottle from './LoadingBottle'; // Import the loading component
import "./BugDetail.css"
const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000';

export default function BugDetail() {
  const { id } = useParams();
  const [bug, setBug] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [originalBug , setOriginalBug]=useState(null)

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
        setOriginalBug(data)
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

  return (
    <div className="bug-detail">
           
  <div className="bug-detail-card">
    <Link to={`/bug/edit/${bug._id}`}   >
 <button>Edit</button></Link> 
          <h2>{bug.title || 'Untitled Bug'}</h2>

        <p><strong>ID:</strong> {bug._id}</p>
        {/* <p><strong>Severity:</strong> {bug.severity || 'Not specified'}</p> */}
        <p>
  <strong>Severity:</strong> {bug.severity}
  {originalBug?.severity !== bug.severity && (
    <span className="diff">
      (was: {originalBug.severity})
    </span>
  )}
</p>
        <p><strong>Priority:</strong> {bug.priority || 'Not specified'}</p>
        <p><strong>Status:</strong> {bug.status || 'Open'}</p>
        <p><strong>Bug Type:</strong> {bug.bugType || 'Not specified'}</p>
     
        <strong>Description:</strong>
        <p>{bug.component}</p>
        <strong>actual_result:</strong>
        <p>{bug.actual_result}</p>
<strong>expected_result:</strong>
<p>{bug.expected_result}</p>
 <strong>labels:</strong> 
 <p>{bug.labels}</p>
      {bug.created_at && (
        <p className="bug-date">
          <strong>Created:</strong> {new Date(bug.created_at).toLocaleString()}
        </p>
      )}
      {bug.human_edited && (
        <p className="edited-note">
          <em>This bug has been manually edited</em>
        </p>
      )}
    </div>
     </div>
  );
}