import BugDetail from "./BugDetail";
import BugForm from "./BugForm";
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import BugEdit from "./BugEdit";
import TestComp from './TestComp'

function App() {
  
  return (
    <div style={{ padding: "2rem" }}>
     <Router>
      <Routes>
        <Route path="/bug/:id" element={<BugDetail />}   />
        <Route path="/" element={      <BugForm />}   />
        <Route path="/bug/edit/:id" element={<BugEdit />}   />
      </Routes>
    </Router> 
    {/* <TestComp></TestComp> */}
    </div>
  );
}


export default App;
