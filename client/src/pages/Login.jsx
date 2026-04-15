import React, { useState, useContext } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axiosInstance from '../api/axiosConfig';
import { AuthContext } from '../context/AuthContext';
import Logo from '@/assets/potspot-logo.svg';

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
      setError(err.response?.data?.message || 'Authentication failed. Tactical link dropped.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0e0e10] flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-[#1f1f22] p-8 mt-12 mb-12 shadow-[0_20px_50px_rgba(0,0,0,0.5)]">
        
        {/* Header Section */}
        <div className="flex flex-col items-start mb-10">
          <img src={Logo} alt="PotSpot Observer Node" className="w-16 h-16 mb-4" />
          <h1 className="text-3xl font-bold font-['Space_Grotesk'] text-[#fefbfe] uppercase tracking-wide">
            PotSpot
          </h1>
          <h2 className="text-sm font-['Public_Sans'] text-[#e2e2e2] opacity-80 uppercase tracking-widest mt-1">
            Observer Node Login
          </h2>
        </div>

        {/* Error Badge */}
        {error && (
          <div className="bg-[#d53d18]/10 text-[#d53d18] font-['Space_Grotesk'] uppercase text-sm font-bold border-l-4 border-[#d53d18] p-3 mb-6">
            ERROR: {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="flex flex-col gap-6">
          <div className="flex flex-col gap-2">
            <label className="font-['Space_Grotesk'] text-xs font-bold text-[#e2e2e2] uppercase tracking-[0.05em]">
              Agent Email
            </label>
            <input 
              type="email" 
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="bg-[#252528] text-[#fefbfe] font-['Public_Sans'] px-4 py-3 outline-none border-b-2 border-transparent focus:border-[#f8a826] focus:bg-[#131315] transition-colors rounded-sm"
              placeholder="operator@potspot.network"
            />
          </div>

          <div className="flex flex-col gap-2">
            <label className="font-['Space_Grotesk'] text-xs font-bold text-[#e2e2e2] uppercase tracking-[0.05em]">
              Passkey
            </label>
            <input 
              type="password" 
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="bg-[#252528] text-[#fefbfe] font-['Public_Sans'] px-4 py-3 outline-none border-b-2 border-transparent focus:border-[#f8a826] focus:bg-[#131315] transition-colors rounded-sm"
              placeholder="••••••••"
            />
          </div>

          <button 
            type="submit" 
            disabled={isLoading}
            className="mt-4 font-['Space_Grotesk'] uppercase font-bold text-[#0e0e10] py-4 rounded-sm transition-transform active:scale-[0.98] shadow-inner disabled:opacity-50"
            style={{ backgroundImage: 'linear-gradient(135deg, #f8a826 0%, #df9305 100%)' }}
          >
            {isLoading ? 'Authenticating...' : 'Engage Link'}
          </button>
        </form>

        <div className="mt-8 text-center font-['Public_Sans'] text-sm text-[#e2e2e2] opacity-70">
          Unregistered node? <Link to="/register" className="text-[#f8a826] font-bold hover:underline">Request Access</Link>
        </div>
      </div>
    </div>
  );
};

export default Login;
