import React, { useState, useContext } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axiosInstance from '../api/axiosConfig';
import { AuthContext } from '../context/AuthContext';
import Logo from '../assets/potspot-logo.svg';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  
  const navigate = useNavigate();
  const { login } = useContext(AuthContext);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
      const response = await axiosInstance.post('/api/auth/login', { email, password });
      
      const { token, ...userData } = response.data;
      login(token, userData);
      
      navigate('/');
    } catch (err) {
      setError(err.response?.data?.message || 'Authentication failed. Please check your credentials.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div 
      className="min-h-screen w-full flex items-center justify-center" 
      style={{ backgroundColor: '#1C1C1E', boxSizing: 'border-box', padding: '20px' }}
    >
      <div style={{ backgroundColor: '#2C2C2E', borderRadius: '16px', padding: '40px', width: '100%', maxWidth: '420px', boxSizing: 'border-box' }}>
        
        <img 
          src={Logo} 
          alt="PotSpot Logo" 
          style={{ width: '180px', display: 'block', margin: '0 auto 24px' }}
        />

        <h2 style={{ color: '#FFFFFF', fontWeight: 'bold', textAlign: 'center', marginBottom: '24px', fontSize: '24px', fontFamily: 'sans-serif' }}>
          Welcome back
        </h2>

        {error && (
          <div style={{ backgroundColor: 'rgba(213, 61, 24, 0.1)', color: '#d53d18', borderLeft: '4px solid #d53d18', padding: '12px', marginBottom: '24px', fontSize: '14px', fontWeight: 'bold', fontFamily: 'sans-serif' }}>
            ERROR: {error}
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <div>
            <label style={{ color: '#888888', display: 'block', marginBottom: '8px', fontSize: '12px', fontWeight: 'bold', textTransform: 'uppercase', fontFamily: 'sans-serif' }}>
              Email Address
            </label>
            <input 
              type="email" 
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              style={{ backgroundColor: '#3A3A3C', border: '1px solid #48484A', color: '#FFFFFF', borderRadius: '8px', padding: '12px', width: '100%', boxSizing: 'border-box', outline: 'none', fontFamily: 'sans-serif' }}
              placeholder="operator@potspot.network"
            />
          </div>

          <div>
            <label style={{ color: '#888888', display: 'block', marginBottom: '8px', fontSize: '12px', fontWeight: 'bold', textTransform: 'uppercase', fontFamily: 'sans-serif' }}>
              Password
            </label>
            <input 
              type="password" 
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              style={{ backgroundColor: '#3A3A3C', border: '1px solid #48484A', color: '#FFFFFF', borderRadius: '8px', padding: '12px', width: '100%', boxSizing: 'border-box', outline: 'none', fontFamily: 'sans-serif' }}
              placeholder="••••••••"
            />
          </div>

          <button 
            type="submit" 
            disabled={isLoading}
            style={{ backgroundColor: '#F5A623', color: '#000000', fontWeight: '700', borderRadius: '8px', padding: '12px', width: '100%', cursor: 'pointer', border: 'none', marginTop: '8px', opacity: isLoading ? 0.7 : 1, fontFamily: 'sans-serif', textTransform: 'uppercase', fontSize: '14px' }}
          >
            {isLoading ? 'Authenticating...' : 'Sign In'}
          </button>
        </form>

        <div style={{ textAlign: 'center', marginTop: '24px', color: '#e2e2e2', fontFamily: 'sans-serif', fontSize: '14px' }}>
          Don't have an account? <Link to="/register" style={{ color: '#F5A623', fontWeight: 'bold', textDecoration: 'none', marginLeft: '4px' }}>Register</Link>
        </div>
      </div>
    </div>
  );
};

export default Login;
