import React, { useState, useEffect } from 'react';
import axiosInstance from '../api/axiosConfig';

const wrapperStyle = {
  position: 'fixed',
  top: 0,
  right: 0,
  bottom: 0,
  zIndex: 3000,
  width: '100%',
  maxWidth: '420px',
  backgroundColor: '#1f1f22',
  display: 'flex',
  flexDirection: 'column',
  boxShadow: '-20px 0 50px rgba(0,0,0,0.5)',
  boxSizing: 'border-box'
};

const headerStyle = {
  backgroundColor: '#0e0e10',
  padding: '24px',
  borderBottom: '2px solid #F5A623',
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  boxSizing: 'border-box'
};

const titleStyle = {
  color: '#FFFFFF',
  fontFamily: '"Space Grotesk", sans-serif',
  fontSize: '24px',
  fontWeight: '700',
  textTransform: 'uppercase',
  letterSpacing: '3px',
  margin: 0,
  borderLeft: '3px solid #f8a826',
  paddingLeft: '16px'
};

const subtitleStyle = {
  fontFamily: '"Space Grotesk", sans-serif',
  fontSize: '11px',
  letterSpacing: '1px',
  color: '#888888',
  marginTop: '4px'
};

const getCloseButtonStyle = (isHovering) => ({
  background: 'none',
  border: 'none',
  color: isHovering ? '#f8a826' : '#888888',
  cursor: 'pointer',
  fontSize: '24px',
  padding: 0,
  lineHeight: 1,
  transition: 'color 0.2s ease'
});

const formBodyStyle = {
  padding: '24px',
  overflowY: 'auto',
  flex: 1,
  boxSizing: 'border-box'
};

const labelStyle = {
  fontFamily: '"Space Grotesk", sans-serif',
  fontSize: '11px',
  fontWeight: '700',
  textTransform: 'uppercase',
  letterSpacing: '2px',
  color: '#888888',
  display: 'block',
  marginBottom: '8px'
};

const inputStyle = {
  backgroundColor: '#2C2C2E',
  color: '#FFFFFF',
  border: '1px solid #48484A',
  borderRadius: '0px',
  padding: '12px',
  width: '100%',
  fontFamily: '"Public Sans", sans-serif',
  fontSize: '15px',
  boxSizing: 'border-box'
};

const getCategoryInputStyle = (isFocused, isHovered) => ({
  ...inputStyle,
  backgroundColor: '#252528',
  border: 'none',
  borderBottom: isFocused || isHovered ? '2px solid #f8a826' : '2px solid transparent',
  borderBottomLeftRadius: '0px',
  borderBottomRightRadius: '0px',
  outline: 'none',
  WebkitAppearance: 'none',
  accentColor: '#f8a826',
  transition: 'all 0.2s ease'
});

const severityContainerStyle = {
  display: 'flex',
  gap: '8px'
};

const getSeverityButtonStyle = (isActive, isHovered) => ({
  padding: '8px',
  fontFamily: '"Space Grotesk", sans-serif',
  fontWeight: '700',
  fontSize: '13px',
  letterSpacing: '1px',
  textTransform: 'uppercase',
  border: isActive ? '2px solid #F5A623' : '2px solid transparent',
  borderRadius: '0px',
  cursor: 'pointer',
  backgroundColor: isActive ? '#2C2C2E' : isHovered ? '#252528' : '#131315',
  color: isActive ? '#FFFFFF' : '#888888',
  flex: 1,
  boxSizing: 'border-box',
  transition: 'background-color 0.2s ease'
});

const getSubmitButtonStyle = (isHovering, isDisabled) => ({
  background: 'linear-gradient(135deg, #f8a826 0%, #df9305 100%)',
  color: '#000000',
  fontFamily: '"Space Grotesk", sans-serif',
  fontSize: '13px',
  fontWeight: '700',
  letterSpacing: '3px',
  textTransform: 'uppercase',
  padding: '16px',
  width: '100%',
  border: 'none',
  borderRadius: '0px',
  cursor: isDisabled ? 'not-allowed' : 'pointer',
  marginTop: '24px',
  boxSizing: 'border-box',
  boxShadow: isHovering && !isDisabled ? '0 6px 30px rgba(248, 168, 38, 0.55)' : '0 4px 20px rgba(248, 168, 38, 0.35)',
  transform: isHovering && !isDisabled ? 'translateY(-1px)' : 'none',
  transition: 'all 0.2s ease',
  opacity: isDisabled ? 0.5 : 1
});

const errorBoxStyle = {
  backgroundColor: 'rgba(213,61,24,0.1)',
  color: '#d53d18',
  borderLeft: '4px solid #d53d18',
  padding: '12px',
  marginBottom: '24px',
  fontSize: '14px',
  boxSizing: 'border-box'
};

const formGroupStyle = {
  marginBottom: '20px'
};

const ReportForm = ({ location, onClose }) => {
  const [category, setCategory] = useState('pothole');
  const [severity, setSeverity] = useState('medium');
  const [description, setDescription] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);

  // Micro-interaction states
  const [isHoveringSubmit, setIsHoveringSubmit] = useState(false);
  const [hoveredSeverity, setHoveredSeverity] = useState(null);
  const [isHoveringClose, setIsHoveringClose] = useState(false);
  const [isCategoryFocused, setIsCategoryFocused] = useState(false);
  const [isCategoryHovered, setIsCategoryHovered] = useState(false);
  const [locationLabel, setLocationLabel] = useState('');

  useEffect(() => {
    if (!location) return;
    
    const timeoutId = setTimeout(async () => {
      try {
        const response = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${location.lat}&lon=${location.lng}`, {
          headers: {
            'User-Agent': 'PotSpot/1.0'
          }
        });
        const data = await response.json();
        if (data && data.display_name) {
          const parts = data.display_name.split(',').slice(0, 3).join(',');
          setLocationLabel(parts.trim());
        } else {
          setLocationLabel('');
        }
      } catch (err) {
        console.error('Reverse geocode failed', err);
        setLocationLabel('');
      }
    }, 1000);

    return () => clearTimeout(timeoutId);
  }, [location]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    const payload = {
      location: {
        type: 'Point',
        coordinates: [location.lng, location.lat]
      },
      category,
      severity,
      description
    };

    try {
      await axiosInstance.post('/api/reports', payload);
      onClose();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to submit report. Network error.');
      setIsSubmitting(false);
    }
  };

  return (
    <div style={wrapperStyle}>
      <div style={headerStyle}>
        <div>
          <h2 style={titleStyle}>Log Hazard</h2>
          <div style={subtitleStyle}>
            {locationLabel || `${location.lat.toFixed(4)}°S, ${location.lng.toFixed(4)}°E`}
          </div>
        </div>
        <button
          onClick={onClose}
          style={getCloseButtonStyle(isHoveringClose)}
          onMouseEnter={() => setIsHoveringClose(true)}
          onMouseLeave={() => setIsHoveringClose(false)}
        >
          &times;
        </button>
      </div>

      <div style={formBodyStyle}>
        {error && (
          <div style={errorBoxStyle}>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div style={formGroupStyle}>
            <label style={labelStyle}>Category</label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              onFocus={() => setIsCategoryFocused(true)}
              onBlur={() => setIsCategoryFocused(false)}
              onMouseEnter={() => setIsCategoryHovered(true)}
              onMouseLeave={() => setIsCategoryHovered(false)}
              style={getCategoryInputStyle(isCategoryFocused, isCategoryHovered)}
            >
              <option value="pothole">Pothole</option>
              <option value="flooding">Flooding</option>
              <option value="accident">Accident</option>
              <option value="road_closure">Road Closure</option>
              <option value="other">Other</option>
            </select>
          </div>

          <div style={formGroupStyle}>
            <label style={labelStyle}>Severity</label>
            <div style={severityContainerStyle}>
              {['low', 'medium', 'high'].map(sev => (
                <button
                  key={sev}
                  type="button"
                  onClick={() => setSeverity(sev)}
                  onMouseEnter={() => setHoveredSeverity(sev)}
                  onMouseLeave={() => setHoveredSeverity(null)}
                  style={getSeverityButtonStyle(severity === sev, hoveredSeverity === sev)}
                >
                  {sev}
                </button>
              ))}
            </div>
          </div>

          <div style={formGroupStyle}>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <label style={labelStyle}>
                Description (optional)
              </label>
              <span style={{ fontSize: '12px', color: description.length > 300 ? '#d53d18' : '#888888' }}>
                {description.length} / 300
              </span>
            </div>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              maxLength={300}
              rows={4}
              style={{ ...inputStyle, resize: 'none' }}
              placeholder="Provide details..."
            />
          </div>

          <button
            type="submit"
            disabled={isSubmitting || description.length > 300}
            onMouseEnter={() => setIsHoveringSubmit(true)}
            onMouseLeave={() => setIsHoveringSubmit(false)}
            style={getSubmitButtonStyle(isHoveringSubmit, isSubmitting || description.length > 300)}
          >
            {isSubmitting ? 'Submitting...' : 'Submit Report'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default ReportForm;
