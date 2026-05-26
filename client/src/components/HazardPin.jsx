import React, { useEffect, useState } from 'react';
import { Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import { formatDistanceToNow } from 'date-fns';

const getCategoryDetails = (category) => {
  switch (category) {
    case 'pothole':
      return { colour: '#f8a826', label: 'Pothole' };
    case 'flooding':
      return { colour: '#3b82f6', label: 'Flooding' };
    case 'accident':
      return { colour: '#d53d18', label: 'Accident' };
    case 'road_closure':
      return { colour: '#f97316', label: 'Road Closure' };
    default:
      return { colour: '#9ca3af', label: 'Other' };
  }
};

const createCustomIcon = (colour) => {
  const html = `
    <div style="position: relative; width: 20px; height: 20px;">
      <div class="potspot-pulse" style="
        background-color: ${colour};
        width: 20px;
        height: 20px;
        position: absolute;
        top: 0;
        left: 0;
        opacity: 0.4;
        transform: rotate(45deg);
      "></div>
      <div style="
        background-color: ${colour};
        width: 20px;
        height: 20px;
        display: flex;
        justify-content: center;
        align-items: center;
        border: 3px solid #0e0e10;
        box-shadow: 0 4px 10px rgba(0,0,0,0.6);
        position: absolute;
        top: 0;
        left: 0;
        transform: rotate(45deg);
        z-index: 10;
        box-sizing: border-box;
      ">
        <div style="background-color: #0e0e10; width: 6px; height: 6px;"></div>
      </div>
    </div>
  `;
  
  return L.divIcon({
    className: 'custom-hazard-pin',
    html,
    iconSize: [20, 20],
    iconAnchor: [10, 20],
    popupAnchor: [0, -22],
  });
};

const HazardPin = ({ report }) => {
  const { location, category, severity, address, createdAt, upvotes } = report;
  const [lng, lat] = location.coordinates;
  const { colour, label } = getCategoryDetails(category);
  const timeSince = formatDistanceToNow(new Date(createdAt), { addSuffix: true });
  const [isUpvoteHovered, setIsUpvoteHovered] = useState(false);

  const customIcon = createCustomIcon(colour);

  useEffect(() => {
    if (!document.getElementById('potspot-map-styles')) {
      const style = document.createElement('style');
      style.id = 'potspot-map-styles';
      style.innerHTML = `
        @keyframes potspot-ping {
          0% { transform: scale(1) rotate(45deg); opacity: 0.8; }
          70% { transform: scale(2.5) rotate(45deg); opacity: 0; }
          100% { transform: scale(2.5) rotate(45deg); opacity: 0; }
        }
        .potspot-pulse { animation: potspot-ping 2s ease-out infinite; }
        .leaflet-popup-content-wrapper { border: none !important; box-shadow: 0 4px 20px rgba(0,0,0,0.5) !important; background: transparent !important; padding: 0 !important; }
        .leaflet-popup-content { margin: 0 !important; }
        .leaflet-popup-tip { display: none !important; }
      `;
      document.head.appendChild(style);
    }
  }, []);

  const popupContainerStyle = {
    display: 'flex',
    flexDirection: 'column',
    backgroundColor: '#1f1f22',
    padding: '12px',
    boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
    borderLeft: `4px solid ${colour}`,
    minWidth: '180px',
    boxSizing: 'border-box'
  };

  const popupHeaderStyle = {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '8px',
    paddingBottom: '8px',
    paddingRight: '24px',
    borderBottom: '1px solid #252528'
  };

  const labelStyle = {
    fontFamily: '"Space Grotesk", sans-serif',
    color: '#fefbfe',
    fontWeight: 'bold',
    textTransform: 'uppercase',
    letterSpacing: '0.05em',
    fontSize: '14px',
    margin: 0
  };

  const getSeverityStyle = (sev) => {
    let bg = '#e2e2e2';
    let col = '#0e0e10';
    if (sev === 'high') { bg = '#d53d18'; col = '#fefbfe'; }
    else if (sev === 'medium') { bg = '#df9305'; col = '#0e0e10'; }
    
    return {
      fontSize: '10px',
      textTransform: 'uppercase',
      fontWeight: 'bold',
      padding: '2px 8px',
      borderRadius: '2px',
      backgroundColor: bg,
      color: col
    };
  };

  const addressStyle = {
    fontFamily: '"Public Sans", sans-serif',
    fontSize: '12px',
    color: '#e2e2e2',
    opacity: 0.9,
    marginBottom: '12px',
    lineHeight: 1.25
  };

  const footerStyle = {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    marginTop: 'auto',
    paddingTop: '8px'
  };

  const timeStyle = {
    fontFamily: '"Space Grotesk", sans-serif',
    fontSize: '10px',
    textTransform: 'uppercase',
    color: '#e2e2e2',
    opacity: 0.6
  };

  const upvoteStyle = {
    display: 'flex',
    alignItems: 'center',
    gap: '4px',
    fontFamily: '"Space Grotesk", sans-serif',
    color: '#f8a826',
    fontWeight: 'bold',
    fontSize: '12px'
  };

  return (
    <Marker position={[lat, lng]} icon={customIcon}>
      <Popup className="tactical-popup">
        <div style={popupContainerStyle}>
          <div 
            style={{ cursor: 'pointer' }} 
            onClick={() => window.location.href = `/report/${report._id}`}
          >
            <div style={popupHeaderStyle}>
              <span style={labelStyle}>
                {label}
              </span>
              <span style={getSeverityStyle(severity)}>
                {severity}
              </span>
            </div>

            <div style={addressStyle}>
              {address || 'Coordinates Only'}
            </div>
          </div>

          <div style={footerStyle}>
            <div style={timeStyle}>
              {timeSince}
            </div>
            <div 
              style={{ ...upvoteStyle, cursor: 'pointer', textDecoration: isUpvoteHovered ? 'underline' : 'none' }}
              onMouseEnter={() => setIsUpvoteHovered(true)}
              onMouseLeave={() => setIsUpvoteHovered(false)}
              onClick={() => {
                fetch(`/api/reports/${report._id}/upvote`, { 
                  method: 'PUT', 
                  headers: { 
                    'Authorization': 'Bearer ' + localStorage.getItem('token'), 
                    'Content-Type': 'application/json' 
                  } 
                }).then(() => window.dispatchEvent(new CustomEvent('upvote_from_popup', { detail: { reportId: report._id } })))
              }}
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M14.707 12.293a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 111.414-1.414L9 14.586V3a1 1 0 012 0v11.586l2.293-2.293a1 1 0 011.414 0z" clipRule="evenodd" transform="rotate(180 10 10)" />
              </svg>
              {(upvotes || []).length}
            </div>
          </div>
        </div>
      </Popup>
    </Marker>
  );
};

export default HazardPin;
