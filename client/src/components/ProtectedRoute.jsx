import React, { useContext } from 'react';
import { Navigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import Navbar from './Navbar';
import BottomNav from './BottomNav';

const ProtectedRoute = ({ children }) => {
  const { token, loading } = useContext(AuthContext);

  if (loading) {
    return (
      <div style={{ minHeight: '100vh', backgroundColor: '#0e0e10', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#f8a826', fontFamily: 'monospace' }}>
        Loading...
      </div>
    );
  }

  if (!token) {
    return <Navigate to="/login" replace />;
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh', backgroundColor: '#0e0e10' }}>
      <Navbar />
      <div style={{ flex: 1, overflowY: 'auto', position: 'relative', paddingBottom: '64px' }}>
        {children}
      </div>
      <BottomNav />
    </div>
  );
};

export default ProtectedRoute;
