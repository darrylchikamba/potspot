import React from 'react';
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
    <div style="
      background-color: ${colour};
      width: 20px;
      height: 20px;
      display: flex;
      justify-content: center;
      align-items: center;
      border: 3px solid #0e0e10;
      box-shadow: 0 4px 10px rgba(0,0,0,0.6);
      position: relative;
      transform: rotate(45deg);
    ">
      <div style="background-color: #0e0e10; width: 6px; height: 6px;"></div>
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

  const customIcon = createCustomIcon(colour);

  return (
    <Marker position={[lat, lng]} icon={customIcon}>
      <Popup className="tactical-popup">
        <div className="flex flex-col bg-[#1f1f22] p-3 shadow-lg border-l-4" style={{ borderColor: colour, minWidth: '180px' }}>
          <div className="flex justify-between items-center mb-2 pb-2 border-b border-[#252528]">
            <span className="font-['Space_Grotesk'] text-[#fefbfe] font-bold uppercase tracking-wider text-sm">
              {label}
            </span>
            <span className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded-sm ${
              severity === 'high' ? 'bg-[#d53d18] text-[#fefbfe]' : 
              severity === 'medium' ? 'bg-[#df9305] text-[#0e0e10]' : 
              'bg-[#e2e2e2] text-[#0e0e10]'
            }`}>
              {severity}
            </span>
          </div>

          <div className="font-['Public_Sans'] text-xs text-[#e2e2e2] opacity-90 mb-3 leading-tight">
            {address || 'Coordinates Only'}
          </div>

          <div className="flex justify-between items-end mt-auto pt-2">
            <div className="font-['Space_Grotesk'] text-[10px] uppercase text-[#e2e2e2] opacity-60">
              {timeSince}
            </div>
            <div className="flex items-center gap-1 font-['Space_Grotesk'] text-[#f8a826] font-bold text-xs">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M14.707 12.293a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 111.414-1.414L9 14.586V3a1 1 0 012 0v11.586l2.293-2.293a1 1 0 011.414 0z" clipRule="evenodd" transform="rotate(180 10 10)" />
              </svg>
              {upvotes.length}
            </div>
          </div>
        </div>
      </Popup>
    </Marker>
  );
};

export default HazardPin;
