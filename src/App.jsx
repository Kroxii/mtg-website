import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navigation from './components/Navigation';
import Home from './pages/Home';
import Collection from './pages/Collection';
import DeckLists from './pages/DeckLists';
import './App.css'

function App() {
  return (
    <Router>
      <div className="app">
        <Navigation />
        <main className="main-content">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/collection" element={<Collection />} />
            <Route path="/decklists" element={<DeckLists />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App
