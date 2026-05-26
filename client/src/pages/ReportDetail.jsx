import React, { useState, useEffect, useContext } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import axiosInstance from '../api/axiosConfig';
import { AuthContext } from '../context/AuthContext';
import { formatDistanceToNow } from 'date-fns';

const pageStyle = {
  minHeight: '100%',
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

const topNavStyle = {
  marginBottom: '24px'
};

const backLinkStyle = {
  color: '#888888',
  textDecoration: 'none',
  fontSize: '14px',
  display: 'inline-flex',
  alignItems: 'center',
  gap: '8px',
  transition: 'color 0.2s'
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

const cardStyle = {
  backgroundColor: '#1f1f22',
  boxShadow: '0 10px 30px rgba(0,0,0,0.5)',
  padding: '32px',
  display: 'flex',
  flexDirection: 'column',
  gap: '24px',
  boxSizing: 'border-box'
};

const badgeBaseStyle = {
  fontFamily: '"Space Grotesk", sans-serif',
  fontSize: '12px',
  fontWeight: '700',
  textTransform: 'uppercase',
  letterSpacing: '1px',
  padding: '6px 12px',
  borderRadius: '4px',
  display: 'inline-block'
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

const sectionTitleStyle = {
  fontFamily: '"Space Grotesk", sans-serif',
  color: '#888888',
  fontSize: '12px',
  fontWeight: '700',
  textTransform: 'uppercase',
  letterSpacing: '1px',
  marginBottom: '8px'
};

const detailTextStyle = {
  color: '#fefbfe',
  fontSize: '16px',
  lineHeight: '1.5',
  margin: 0
};

const upvoteButtonStyle = (isActive) => ({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  gap: '8px',
  width: '100%',
  padding: '16px',
  backgroundColor: isActive ? '#f8a826' : 'transparent',
  border: isActive ? '2px solid #f8a826' : '2px solid #48484A',
  color: isActive ? '#000000' : '#e2e2e2',
  fontFamily: '"Space Grotesk", sans-serif',
  fontWeight: '700',
  fontSize: '14px',
  textTransform: 'uppercase',
  letterSpacing: '1px',
  cursor: 'pointer',
  borderRadius: '8px',
  transition: 'all 0.2s',
  marginTop: '16px'
});

const actionRowStyle = {
  display: 'flex',
  justifyContent: 'flex-end',
  gap: '12px',
  marginTop: '24px',
  paddingTop: '24px',
  borderTop: '1px solid #252528'
};

const buttonBaseStyle = {
  fontFamily: '"Space Grotesk", sans-serif',
  fontWeight: '700',
  fontSize: '12px',
  textTransform: 'uppercase',
  letterSpacing: '1px',
  padding: '12px 20px',
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

const ReportDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useContext(AuthContext);
  
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchReport = async () => {
    try {
      const { data } = await axiosInstance.get(`/api/reports/${id}`);
      console.log('Raw Report Data:', data);
      setReport(data);
    } catch (err) {
      setError('Report not found or network error occurred.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReport();
  }, [id]);

  const handleUpvote = async () => {
    try {
      await axiosInstance.put(`/api/reports/${id}/upvote`);
      fetchReport();
    } catch (err) {
      console.error('Failed to update upvote', err);
    }
  };

  const handleResolve = async () => {
    try {
      await axiosInstance.put(`/api/reports/${id}/resolve`);
      fetchReport();
    } catch (err) {
      console.error('Failed to resolve report', err);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm('Are you sure you want to permanently delete this report?')) return;
    try {
      await axiosInstance.delete(`/api/reports/${id}`);
      navigate('/my-reports');
    } catch (err) {
      console.error('Failed to delete report', err);
    }
  };

  if (loading) {
    return (
      <div style={pageStyle}>
        <div style={containerStyle}>
          <div style={{ color: '#f8a826', fontFamily: '"Space Grotesk", sans-serif' }}>Loading report details...</div>
        </div>
      </div>
    );
  }

  if (error || !report) {
    return (
      <div style={pageStyle}>
        <div style={containerStyle}>
          <div style={topNavStyle}>
            <Link to="/my-reports" style={backLinkStyle}>← Back to My Reports</Link>
          </div>
          <div style={{ ...cardStyle, color: '#d53d18' }}>{error || 'Report unavailable.'}</div>
        </div>
      </div>
    );
  }

  const isOwner = report.user?._id?.toString() === user?._id?.toString();
  const hasUpvoted = (report.upvotes || []).some(voterId => voterId.toString() === user?._id?.toString());
  const isResolved = report.status === 'resolved';
  const timeSince = formatDistanceToNow(new Date(report.createdAt), { addSuffix: true });
  
  // report.user might be populated, so we check if it's an object with username
  const reporterName = report.user?.username || 'Unknown Operator';

  return (
    <div style={pageStyle}>
      <div style={containerStyle}>
        
        <div style={topNavStyle}>
          <Link to="/my-reports" style={backLinkStyle}>← Back to My Reports</Link>
        </div>

        <div style={{ ...cardStyle, borderTop: `6px solid ${getCategoryColour(report.category)}` }}>
          
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '16px' }}>
            <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
              <span style={{ ...badgeBaseStyle, backgroundColor: getCategoryColour(report.category), color: '#000' }}>
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

          <div>
            <div style={sectionTitleStyle}>Location</div>
            <p style={{ ...detailTextStyle, fontWeight: '700', fontSize: '20px' }}>
              {report.address || 'Address Unavailable'}
            </p>
            <p style={{ color: '#888888', fontSize: '14px', marginTop: '4px' }}>
              Lat: {report.location.coordinates[1].toFixed(6)}, Lng: {report.location.coordinates[0].toFixed(6)}
            </p>
          </div>

          {report.description && (
            <div>
              <div style={sectionTitleStyle}>Description</div>
              <p style={detailTextStyle}>{report.description}</p>
            </div>
          )}

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px', backgroundColor: '#131315', padding: '16px', borderRadius: '8px' }}>
            <div>
              <div style={sectionTitleStyle}>Reported By</div>
              <p style={{ color: '#e2e2e2', margin: 0, fontSize: '14px' }}>{reporterName}</p>
            </div>
            <div>
              <div style={sectionTitleStyle}>Time Logged</div>
              <p style={{ color: '#e2e2e2', margin: 0, fontSize: '14px' }}>{timeSince}</p>
            </div>
          </div>

          <button onClick={handleUpvote} style={upvoteButtonStyle(hasUpvoted)}>
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 20 20" fill={hasUpvoted ? "currentColor" : "none"} stroke="currentColor" strokeWidth={hasUpvoted ? "0" : "2"}>
              <path fillRule="evenodd" d="M14.707 12.293a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 111.414-1.414L9 14.586V3a1 1 0 012 0v11.586l2.293-2.293a1 1 0 011.414 0z" clipRule="evenodd" transform="rotate(180 10 10)" />
            </svg>
            {hasUpvoted ? 'Upvoted' : 'Upvote Hazard'} ({(report.upvotes || []).length})
          </button>

          {isOwner && (
            <div style={actionRowStyle}>
              <button onClick={handleDelete} style={deleteButtonStyle}>
                Delete Report
              </button>
              {!isResolved && (
                <button onClick={handleResolve} style={resolveButtonStyle}>
                  Resolve Hazard
                </button>
              )}
            </div>
          )}

        </div>
      </div>
    </div>
  );
};

export default ReportDetail;
