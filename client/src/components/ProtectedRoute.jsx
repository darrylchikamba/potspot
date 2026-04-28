import React, { useContext } from 'react';
import { Navigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import Navbar from './Navbar';

const ProtectedRoute = ({ children }) => {
  const { token, loading } = useContext(AuthContext);

  if (loading) {
    return <div className="min-h-screen bg-[#0e0e10] flex items-center justify-center text-[#f8a826] font-mono">LOADING.SYS...</div>;
  }

  if (!token) {
    return <Navigate to="/login" replace />;
  }

  return (
    <div className="flex flex-col h-screen bg-[#0e0e10]">
      <Navbar />
      <div className="flex-1 overflow-auto relative">
        {children}
      </div>
    </div>
  );
};

export default ProtectedRoute;
