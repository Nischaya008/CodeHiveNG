import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import './App.css';
import LandingPage from './components/landingPage.jsx';
import CodeEditor from './components/codeEditor.jsx';

function App() {
  return (
    <Router>
      <div className="App">
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/editor/:roomId" element={<CodeEditor />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
