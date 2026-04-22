// LoadingBottle.jsx
import './LoadingBottle.css';

export default function LoadingBottle() {
  return (
    <div className="loading-container">
      <section>
        <div className="shadow"></div>
        <div className="bowl">
          <div className="liquid"></div>
        </div>
      </section>
      <p className="loading-text">Loading bug details...</p>
    </div>
  );
}