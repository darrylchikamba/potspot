import React, { useContext } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import Logo from '../assets/potspot-logo.svg';

const Navbar = () => {
  const { logout } = useContext(AuthContext);
  const location = useLocation();

  const isActive = (path) => location.pathname === path;

  return (
    <nav style={{ 
      position: 'fixed', 
      top: 0, 
      left: 0, 
      right: 0, 
      zIndex: 1000, 
      backgroundColor: '#1C1C1E', 
      padding: '12px 24px', 
      display: 'flex', 
      alignItems: 'center', 
      justifyContent: 'space-between',
      borderBottom: '2px solid #f8a826',
      fontFamily: '"Space Grotesk", sans-serif'
    }}>
      <div style={{ display: 'flex', alignItems: 'center' }}>
        <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: '12px', textDecoration: 'none' }}>
          <img src={Logo} alt="PotSpot" style={{ height: '32px', width: '32px' }} />
          <span style={{ fontWeight: 'bold', fontSize: '20px', textTransform: 'uppercase', letterSpacing: '2px', color: '#fefbfe' }}>
            PotSpot
          </span>
        </Link>
      </div>
      
      <div style={{ display: 'flex', alignItems: 'center', gap: '32px' }}>
        <Link 
          to="/" 
          style={{ 
            fontWeight: 'bold', 
            fontSize: '14px', 
            textTransform: 'uppercase', 
            letterSpacing: '1px', 
            textDecoration: 'none',
            color: isActive('/') ? '#f8a826' : '#e2e2e2'
          }}
        >
          Map
        </Link>
        <Link 
          to="/my-reports" 
          style={{ 
            fontWeight: 'bold', 
            fontSize: '14px', 
            textTransform: 'uppercase', 
            letterSpacing: '1px', 
            textDecoration: 'none',
            color: isActive('/my-reports') ? '#f8a826' : '#e2e2e2'
          }}
        >
          My Reports
        </Link>
        <button 
          onClick={logout}
          style={{
            fontWeight: 'bold', 
            fontSize: '12px', 
            textTransform: 'uppercase', 
            letterSpacing: '2px', 
            color: '#0e0e10', 
            backgroundColor: '#e2e2e2', 
            padding: '8px 16px', 
            borderRadius: '2px',
            border: 'none',
            cursor: 'pointer'
          }}
        >
          Disconnect
        </button>
      </div>
    </nav>
  );
};

export default Navbar;
