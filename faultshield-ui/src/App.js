import React from 'react';
import { BrowserRouter as Router, Routes, Route, NavLink } from 'react-router-dom';
import './App.css';
import Dashboard from './pages/Dashboard';
import JobSubmission from './pages/JobSubmission';
import JobMonitor from './pages/JobMonitor';
import LiveEventLog from './pages/LiveEventLog';
import ExperimentRunner from './pages/ExperimentRunner';
import DecisionsLog from './pages/DecisionsLog';

function App() {
  return (
    <Router>
      <nav className="navbar">
        <div className="navbar-brand">
          <div className="brand-icon">⚡</div>
          FaultShield
        </div>
        <ul className="nav-links">
          <li><NavLink to="/" end className={({isActive}) => isActive ? 'active' : ''}>Dashboard</NavLink></li>
          <li><NavLink to="/submit" className={({isActive}) => isActive ? 'active' : ''}>Submit Job</NavLink></li>
          <li><NavLink to="/monitor" className={({isActive}) => isActive ? 'active' : ''}>Job Monitor</NavLink></li>
          <li><NavLink to="/events" className={({isActive}) => isActive ? 'active' : ''}>Live Events</NavLink></li>
          <li><NavLink to="/experiments" className={({isActive}) => isActive ? 'active' : ''}>Experiments</NavLink></li>
          <li><NavLink to="/decisions" className={({isActive}) => isActive ? 'active' : ''}>Decisions</NavLink></li>
        </ul>
      </nav>
      <div className="page-content">
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/submit" element={<JobSubmission />} />
          <Route path="/monitor" element={<JobMonitor />} />
          <Route path="/events" element={<LiveEventLog />} />
          <Route path="/experiments" element={<ExperimentRunner />} />
          <Route path="/decisions" element={<DecisionsLog />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;