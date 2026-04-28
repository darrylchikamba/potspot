import React, { useState } from 'react';
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
  fontWeight: '700',
  fontSize: '18px',
  letterSpacing: '2px',
  margin: 0
};

const subtitleStyle = {
  color: '#888888',
  fontSize: '12px',
  marginTop: '4px'
};

const closeButtonStyle = {
  background: 'none',
  border: 'none',
  color: '#888888',
  cursor: 'pointer',
  fontSize: '24px',
  padding: 0,
  lineHeight: 1
};

const formBodyStyle = {
  padding: '24px',
  overflowY: 'auto',
  flex: 1,
  boxSizing: 'border-box'
};

const labelStyle = {
  color: '#888888',
  fontSize: '12px',
  fontWeight: '700',
  textTransform: 'uppercase',
  letterSpacing: '1px',
  display: 'block',
  marginBottom: '8px'
};

const inputStyle = {
  backgroundColor: '#2C2C2E',
  color: '#FFFFFF',
  border: '1px solid #48484A',
  borderRadius: '8px',
  padding: '12px',
  width: '100%',
  fontSize: '14px',
  boxSizing: 'border-box',
  fontFamily: 'inherit'
};

const severityContainerStyle = {
  display: 'flex',
  gap: '8px'
};

const getSeverityButtonStyle = (isActive) => ({
  padding: '8px',
  fontWeight: '700',
  fontSize: '12px',
  textTransform: 'uppercase',
  border: isActive ? '2px solid #F5A623' : '2px solid transparent',
  borderRadius: '6px',
  cursor: 'pointer',
  backgroundColor: isActive ? '#2C2C2E' : '#131315',
  color: isActive ? '#FFFFFF' : '#888888',
  flex: 1,
  boxSizing: 'border-box'
});

const submitButtonStyle = {
  backgroundColor: '#F5A623',
  color: '#000000',
  fontWeight: '700',
  padding: '16px',
  width: '100%',
  border: 'none',
  borderRadius: '8px',
  cursor: 'pointer',
  fontSize: '14px',
  letterSpacing: '1px',
  marginTop: '24px',
  boxSizing: 'border-box'
};

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
            Lat: {location.lat.toFixed(4)} | Lng: {location.lng.toFixed(4)}
          </div>
        </div>
        <button onClick={onClose} style={closeButtonStyle}>
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
              style={inputStyle}
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
                  style={getSeverityButtonStyle(severity === sev)}
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
            style={{
              ...submitButtonStyle,
              opacity: (isSubmitting || description.length > 300) ? 0.5 : 1,
              cursor: (isSubmitting || description.length > 300) ? 'not-allowed' : 'pointer'
            }}
          >
            {isSubmitting ? 'Submitting...' : 'Submit Report'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default ReportForm;
