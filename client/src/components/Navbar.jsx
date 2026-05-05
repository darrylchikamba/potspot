import React, { useContext } from 'react';
import { Link } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import Logo from '../assets/potspot-logo.svg';

const Navbar = () => {
  const { user } = useContext(AuthContext);

  return (
    <nav style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      height: '56px',
      zIndex: 1000,
      backgroundColor: '#131315',
      backgroundImage: 'repeating-linear-gradient(45deg, transparent, transparent 40px, rgba(248, 168, 38, 0.03) 40px, rgba(248, 168, 38, 0.03) 80px)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: '0 24px',
      borderBottom: '2px solid #f8a826',
      fontFamily: '"Space Grotesk", sans-serif',
      boxSizing: 'border-box'
    }}>
      <div style={{ display: 'flex', alignItems: 'center', height: '100%' }}>
        <Link to="/" style={{ display: 'flex', alignItems: 'center', textDecoration: 'none' }}>
          <img src={Logo} alt="PotSpot" style={{ height: '44px', width: 'auto', display: 'block' }} />
        </Link>
      </div>

      <div style={{ display: 'flex', alignItems: 'center' }}>
        <span style={{ color: '#f8a826', fontSize: '12px', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '1px' }}>
          {user?.username || 'Operator'}
        </span>
      </div>
    </nav>
  );
};

export default Navbar;
