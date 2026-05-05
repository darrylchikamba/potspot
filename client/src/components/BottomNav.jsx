import React, { useContext, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { Map, ClipboardList, Plus, LogOut } from 'lucide-react';

const BottomNav = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { logout } = useContext(AuthContext);

  const [hoveredNav, setHoveredNav] = useState(null);
  const [isReportHovered, setIsReportHovered] = useState(false);

  const handleLogout = () => {
    if (window.confirm('Are you sure you want to log out?')) {
      logout();
    }
  };

  const handleReport = () => {
    window.dispatchEvent(new CustomEvent('openReportForm'));
  };

  const navItemStyle = (isActive, itemName) => ({
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '4px',
    color: hoveredNav === itemName ? '#fefbfe' : (isActive ? '#f8a826' : '#888888'),
    cursor: 'pointer',
    flex: 1,
    background: 'none',
    border: 'none',
    padding: 0,
    transition: 'color 0.2s ease'
  });

  const labelStyle = {
    fontFamily: '"Space Grotesk", sans-serif',
    fontSize: '8px',
    textTransform: 'uppercase',
    letterSpacing: '0.5px'
  };

  const reportButtonStyle = (isHovered) => ({
    width: '48px',
    height: '48px',
    borderRadius: '50%',
    background: 'linear-gradient(135deg, #f8a826 0%, #df9305 100%)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    color: '#000000',
    border: 'none',
    cursor: 'pointer',
    boxShadow: isHovered ? '0 6px 25px rgba(248, 168, 38, 0.5)' : '0 4px 15px rgba(245, 166, 35, 0.4)',
    transform: isHovered ? 'scale(1.08)' : 'none',
    transition: 'all 0.2s ease'
  });

  return (
    <div style={{
      position: 'fixed',
      bottom: 0,
      left: 0,
      right: 0,
      height: '64px',
      zIndex: 1000,
      backgroundColor: '#131315',
      borderTop: '1px solid #252528',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-around',
      padding: '0 16px',
      boxSizing: 'border-box'
    }}>
      <button 
        style={navItemStyle(location.pathname === '/', 'map')} 
        onClick={() => navigate('/')}
        onMouseEnter={() => setHoveredNav('map')}
        onMouseLeave={() => setHoveredNav(null)}
      >
        <Map size={24} />
        <span style={labelStyle}>Map</span>
      </button>

      <button 
        style={navItemStyle(location.pathname === '/my-reports', 'my-reports')} 
        onClick={() => navigate('/my-reports')}
        onMouseEnter={() => setHoveredNav('my-reports')}
        onMouseLeave={() => setHoveredNav(null)}
      >
        <ClipboardList size={24} />
        <span style={labelStyle}>My Reports</span>
      </button>

      <div style={{ flex: 1, display: 'flex', justifyContent: 'center' }}>
        <button 
          style={reportButtonStyle(isReportHovered)} 
          onClick={handleReport}
          onMouseEnter={() => setIsReportHovered(true)}
          onMouseLeave={() => setIsReportHovered(false)}
        >
          <Plus size={24} />
        </button>
      </div>

      <button 
        style={navItemStyle(false, 'logout')} 
        onClick={handleLogout}
        onMouseEnter={() => setHoveredNav('logout')}
        onMouseLeave={() => setHoveredNav(null)}
      >
        <LogOut size={24} />
        <span style={labelStyle}>Log Out</span>
      </button>
    </div>
  );
};

export default BottomNav;
