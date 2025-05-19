import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import Dashboard from './Dashboard';
import About from './About';
import CreateLink from './CreateLink';
import Partnerships from './Partnerships';
import BusinessPartnership from './BusinessPartnership';
import BusinessDirectory from './BusinessDirectory';
import AdminPanel from './AdminPanel';
import Settings from './Settings';

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/dashboard" replace />} />
      <Route path="/dashboard" element={<Dashboard />} />
      <Route path="/about" element={<About />} />
      <Route path="/create-link" element={<CreateLink />} />
      <Route path="/partnerships" element={<Partnerships />} />
      <Route path="/business-partnership" element={<BusinessPartnership />} />
      <Route path="/business-directory" element={<BusinessDirectory />} />
      <Route path="/admin-panel" element={<AdminPanel />} />
      <Route path="/settings" element={<Settings />} />
    </Routes>
  );
}