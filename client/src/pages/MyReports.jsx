import React, { useState, useEffect, useContext, useCallback } from 'react';
import { Link } from 'react-router-dom';
import axiosInstance from '../api/axiosConfig';
import { AuthContext } from '../context/AuthContext';
import { formatDistanceToNow } from 'date-fns';

const pageStyle = {
  minHeight: '100vh',
  backgroundColor: '#0e0e10',
  padding: '76px 20px 40px 20px',
  fontFamily: '"Public Sans", sans-serif',
  boxSizing: 'border-box'
};

const containerStyle = {
  maxWidth: '800px',
  margin: '0 auto',
  display: 'flex',
  flexDirection: 'column',
  gap: '24px'
};

const headerStyle = {
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  marginBottom: '16px',
  borderBottom: '2px solid #252528',
  paddingBottom: '16px'
};

const titleStyle = {
  fontFamily: '"Space Grotesk", sans-serif',
  color: '#fefbfe',
  fontSize: '28px',
  fontWeight: '700',
  textTransform: 'uppercase',
  letterSpacing: '2px',
  margin: 0
};

const getCategoryColour = (category) => {
  switch (category) {
    case 'pothole': return '#f8a826';
    case 'flooding': return '#3b82f6';
    case 'accident': return '#d53d18';
    case 'road_closure': return '#f97316';
    default: return '#9ca3af';
  }
};

const getCardStyle = (category) => ({
  backgroundColor: '#1f1f22',
  boxShadow: '0 10px 30px rgba(0,0,0,0.5)',
  borderLeft: `4px solid ${getCategoryColour(category)}`,
  padding: '24px',
  display: 'flex',
  flexDirection: 'column',
  gap: '16px',
  boxSizing: 'border-box'
});

const topRowStyle = {
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'flex-start'
};

const badgeBaseStyle = {
  fontFamily: '"Space Grotesk", sans-serif',
  fontSize: '10px',
  fontWeight: '700',
  textTransform: 'uppercase',
  letterSpacing: '1px',
  padding: '4px 8px',
  borderRadius: '4px'
};

const getSeverityBadgeStyle = (severity) => {
  let bg = '#e2e2e2';
  let color = '#0e0e10';
  if (severity === 'high') { bg = '#d53d18'; color = '#fefbfe'; }
  if (severity === 'medium') { bg = '#df9305'; color = '#0e0e10'; }
  return { ...badgeBaseStyle, backgroundColor: bg, color };
};

const getStatusBadgeStyle = (status) => ({
  ...badgeBaseStyle,
  backgroundColor: status === 'resolved' ? '#252528' : '#131315',
  color: status === 'resolved' ? '#888888' : '#f8a826',
  border: `1px solid ${status === 'resolved' ? '#48484A' : '#f8a826'}`
});

const addressStyle = {
  color: '#e2e2e2',
  fontSize: '16px',
  fontWeight: '500',
  margin: 0
};

const metaStyle = {
  color: '#888888',
  fontSize: '12px',
  display: 'flex',
  gap: '16px',
  alignItems: 'center'
};

const actionRowStyle = {
  display: 'flex',
  justifyContent: 'flex-end',
  gap: '12px',
  marginTop: '8px',
  paddingTop: '16px',
  borderTop: '1px solid #252528'
};

const buttonBaseStyle = {
  fontFamily: '"Space Grotesk", sans-serif',
  fontWeight: '700',
  fontSize: '12px',
  textTransform: 'uppercase',
  letterSpacing: '1px',
  padding: '10px 16px',
  border: 'none',
  cursor: 'pointer',
  transition: 'all 0.2s ease',
  boxSizing: 'border-box'
};

const resolveButtonStyle = {
  ...buttonBaseStyle,
  backgroundColor: '#f8a826',
  color: '#000000'
};

const deleteButtonStyle = {
  ...buttonBaseStyle,
  backgroundColor: 'rgba(213,61,24,0.1)',
  color: '#d53d18',
  border: '1px solid #d53d18'
};

const linkButtonStyle = {
  ...buttonBaseStyle,
  backgroundColor: '#f8a826',
  color: '#000000',
  textDecoration: 'none',
  display: 'inline-block',
  marginTop: '16px'
};

const emptyStateStyle = {
  backgroundColor: '#1f1f22',
  padding: '48px 24px',
  textAlign: 'center',
  color: '#e2e2e2',
  boxShadow: '0 10px 30px rgba(0,0,0,0.5)'
};

const MyReports = () => {
  const { user } = useContext(AuthContext);
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchReports = useCallback(async () => {
    try {
      const { data } = await axiosInstance.get('/api/reports');
      console.log('First report user field:', data[0]?.user);
      console.log('Current user._id:', user?._id);
      const myReports = (data || []).filter(
        report => report.user?._id?.toString() === user?._id?.toString()
      );
      setReports(myReports);
    } catch (err) {
      console.error('Failed to load operations log', err);
    } finally {
      setLoading(false);
    }
  }, [user?._id]);

  useEffect(() => {
    fetchReports();
  }, [fetchReports]);

  const handleResolve = async (id) => {
    try {
      await axiosInstance.put(`/api/reports/${id}/resolve`);
      fetchReports();
    } catch (err) {
      console.error('Failed to resolve report', err);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this report?')) return;
    try {
      await axiosInstance.delete(`/api/reports/${id}`);
      fetchReports();
    } catch (err) {
      console.error('Failed to delete report', err);
    }
  };

  return (
    <div style={pageStyle}>
      <div style={containerStyle}>
        <div style={headerStyle}>
          <h1 style={titleStyle}>My Reports</h1>
        </div>

        {loading ? (
          <div style={{ color: '#f8a826', fontFamily: '"Space Grotesk", sans-serif' }}>Loading records...</div>
        ) : reports.length === 0 ? (
          <div style={emptyStateStyle}>
            <h3 style={{ margin: '0 0 8px 0', fontSize: '18px', color: '#fefbfe' }}>No Hazards Logged</h3>
            <p style={{ margin: 0, color: '#888888', fontSize: '14px' }}>You haven't reported any infrastructure issues yet.</p>
            <Link to="/" style={linkButtonStyle}>Return to Map</Link>
          </div>
        ) : (
          reports.map(report => {
            const isResolved = report.status === 'resolved';
            const timeSince = formatDistanceToNow(new Date(report.createdAt), { addSuffix: true });

            return (
              <div key={report._id} style={getCardStyle(report.category)}>
                <div style={topRowStyle}>
                  <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                    <span style={{
                      ...badgeBaseStyle,
                      backgroundColor: getCategoryColour(report.category),
                      color: '#000'
                    }}>
                      {report.category.replace('_', ' ')}
                    </span>
                    <span style={getSeverityBadgeStyle(report.severity)}>
                      {report.severity}
                    </span>
                  </div>
                  <span style={getStatusBadgeStyle(report.status)}>
                    {report.status}
                  </span>
                </div>

                <h3 style={addressStyle}>
                  <Link to={`/report/${report._id}`} style={{ color: 'inherit', textDecoration: 'none' }}>
                    {report.address || `Lat: ${report.location.coordinates[1].toFixed(4)}, Lng: ${report.location.coordinates[0].toFixed(4)}`}
                  </Link>
                </h3>

                <div style={metaStyle}>
                  <span>Reported {timeSince}</span>
                  <span style={{ display: 'flex', alignItems: 'center', gap: '4px', color: '#f8a826' }}>
                    <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M14.707 12.293a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 111.414-1.414L9 14.586V3a1 1 0 012 0v11.586l2.293-2.293a1 1 0 011.414 0z" clipRule="evenodd" transform="rotate(180 10 10)" />
                    </svg>
                    {report.upvotes.length}
                  </span>
                </div>

                <div style={actionRowStyle}>
                  <button
                    onClick={() => handleDelete(report._id)}
                    style={deleteButtonStyle}
                  >
                    Delete Report
                  </button>
                  {!isResolved && (
                    <button
                      onClick={() => handleResolve(report._id)}
                      style={resolveButtonStyle}
                    >
                      Resolve Hazard
                    </button>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};

export default MyReports;
