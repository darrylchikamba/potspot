import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';

import Login from './pages/Login';
import Register from './pages/Register';

import MapView from './pages/MapView';
import MyReports from './pages/MyReports';
import ReportDetail from './pages/ReportDetail';

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* Public Routes */}
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />

          {/* Protected Routes */}
          <Route 
            path="/" 
            element={
              <ProtectedRoute>
                <MapView />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/report/:id" 
            element={
              <ProtectedRoute>
                <ReportDetail />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/my-reports" 
            element={
              <ProtectedRoute>
                <MyReports />
              </ProtectedRoute>
            } 
          />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
