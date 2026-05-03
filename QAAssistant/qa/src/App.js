import BugDetail from "./BugDetail";
import BugForm from "./BugForm";
import BugEdit from "./BugEdit";
import { HashRouter, Routes, Route } from 'react-router-dom';

function App() {
  return (
    <div style={{ padding: "2rem" }}>
      <HashRouter>
        <Routes>
          <Route path="/" element={<BugForm />} />
          <Route path="/bug/:id" element={<BugDetail />} />
          <Route path="/bug/edit/:id" element={<BugEdit />} />
        </Routes>
      </HashRouter>
    </div>
  );
}

export default App;