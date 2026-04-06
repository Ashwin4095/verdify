import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Landing from './pages/Landing';
import TrackEvent from './pages/TrackEvent';
import Report from './pages/Report';
import PrintReport from './pages/PrintReport';
import Contact from './pages/Contact';

export default function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/track" element={<TrackEvent />} />
        <Route path="/report" element={<Report />} />
        <Route path="/print" element={<PrintReport />} />
        <Route path="/contact" element={<Contact />} />
      </Routes>
    </Router>
  );
}
