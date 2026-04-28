import React, { useState, useEffect, useRef } from 'react';
import { MapContainer, TileLayer, useMap } from 'react-leaflet';
import { io } from 'socket.io-client';
import axiosInstance from '../api/axiosConfig';
import HazardPin from '../components/HazardPin';
import ReportForm from '../components/ReportForm';

// Helper component to smoothly re-centre map on external coordinates
const MapRecentreProvider = ({ centre }) => {
  const map = useMap();
  useEffect(() => {
    if (centre) {
      map.flyTo(centre, map.getZoom());
    }
  }, [centre, map]);
  return null;
};

// Extractor for current centre passing back up
const MapCentreTracker = ({ onMove }) => {
  const map = useMap();
  useEffect(() => {
    const handleMove = () => {
      onMove(map.getCenter());
    };
    map.on('move', handleMove);
    return () => {
      map.off('move', handleMove);
    };
  }, [map, onMove]);
  return null;
};

const MapView = () => {
  const [reports, setReports] = useState([]);
  const [filter, setFilter] = useState('all');
  const [isReporting, setIsReporting] = useState(false);

  const [mapCentre, setMapCentre] = useState([-26.1853, 28.3183]); // Default Benoni
  const [crosshairCentre, setCrosshairCentre] = useState({ lat: -26.1853, lng: 28.3183 });
  const [isLocating, setIsLocating] = useState(true);

  // Fetch Reports
  useEffect(() => {
    const fetchReports = async () => {
      try {
        const { data } = await axiosInstance.get('/api/reports');
        setReports(data || []);
      } catch (error) {
        console.error("Failed to load map data.", error);
      }
    };

    fetchReports();
  }, []);

  // Geolocation
  useEffect(() => {
    if ('geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const latLng = [position.coords.latitude, position.coords.longitude];
          setMapCentre(latLng);
          setCrosshairCentre({ lat: latLng[0], lng: latLng[1] });
          setIsLocating(false);
        },
        (error) => {
          console.warn('Geolocation blocked or failed. Using default centre.', error);
          setIsLocating(false);
        },
        { enableHighAccuracy: true, timeout: 10000 }
      );
    } else {
      setIsLocating(false);
    }
  }, []);

  // WebSockets
  useEffect(() => {
    const socket = io(import.meta.env.VITE_API_URL);

    socket.on('connect', () => {
      console.log('Socket connected.');
    });

    socket.on('new_report', (newReport) => {
      setReports((prev) => [newReport, ...prev]);
    });

    socket.on('upvote_updated', ({ reportId, upvotes }) => {
      setReports((prev) =>
        (prev || []).map(r => r._id === reportId ? { ...r, upvotes } : r)
      );
    });

    return () => {
      socket.disconnect();
    };
  }, []);

  const categories = ['all', 'pothole', 'flooding', 'accident', 'road_closure', 'other'];

  const safeReports = reports || [];
  const filteredReports = filter === 'all'
    ? safeReports
    : safeReports.filter(r => r.category === filter);

  return (
    <div style={{ height: 'calc(100vh - 56px)', width: '100%', marginTop: '56px', position: 'relative', backgroundColor: '#0e0e10' }}>
      {/* Map Context layer */}
      <div style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, zIndex: 1, pointerEvents: 'none' }}>
        <MapContainer
          center={mapCentre}
          zoom={13}
          zoomControl={false}
          style={{ height: '100%', width: '100%', backgroundColor: '#0e0e10', pointerEvents: 'auto' }}
        >
          {/* Brutalist Carto DB Dark matter tiles */}
          <TileLayer
            attribution='&copy; <a href="https://carto.com/">CARTO</a>'
            url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
          />
          <MapRecentreProvider centre={mapCentre} />
          <MapCentreTracker onMove={setCrosshairCentre} />

          {(filteredReports || []).map((report) => (
            <HazardPin key={report._id} report={report} />
          ))}
        </MapContainer>
      </div>

      {/* Target Crosshair */}
      <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-[500] pointer-events-none opacity-50 flex items-center justify-center">
        <div className="w-10 h-10 border-2 border-[#f8a826] flex items-center justify-center rounded-full">
          <div className="w-1 h-1 bg-[#f8a826] rounded-full" />
        </div>
      </div>

      {/* Filter Overlay */}
      <div style={{ position: 'fixed', top: '70px', left: '50%', transform: 'translateX(-50%)', zIndex: 2000, display: 'flex', gap: '8px' }}>
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => setFilter(cat)}
            style={{
              fontFamily: '"Space Grotesk", sans-serif',
              fontWeight: 'bold',
              fontSize: '12px',
              textTransform: 'uppercase',
              padding: '8px 16px',
              cursor: 'pointer',
              border: filter === cat ? '2px solid #f8a826' : '2px solid transparent',
              backgroundColor: filter === cat ? '#f8a826' : 'rgba(31, 31, 34, 0.9)',
              color: filter === cat ? '#0e0e10' : '#e2e2e2',
              boxShadow: '0 4px 6px rgba(0,0,0,0.3)',
              borderRadius: '2px',
              backdropFilter: filter === cat ? 'none' : 'blur(4px)'
            }}
          >
            {cat.replace('_', ' ')}
          </button>
        ))}
      </div>

      {/* Geolocating Overlay Indicator */}
      {isLocating && (
        <div className="absolute top-4 left-1/2 transform -translate-x-1/2 z-[1000] bg-[#1f1f22]/90 border border-[#f8a826] px-4 py-2 text-[#f8a826] font-['Space_Grotesk'] text-xs font-bold uppercase tracking-widest pointer-events-none backdrop-blur-sm shadow-[0_0_15px_rgba(248,168,38,0.3)] animate-pulse">
          Acquiring Satellite Uplink...
        </div>
      )}

      {/* Report FAB */}
      <div
        style={{ position: 'fixed', bottom: '32px', right: '32px', zIndex: 2000 }}
        onClickCapture={() => {
          setIsReporting(true);
          console.log('FAB capture fired, isReporting set to true');
        }}
      >
        <button
          style={{
            backgroundColor: '#F5A623',
            color: '#000',
            fontWeight: '700',
            borderRadius: '50%',
            width: '60px',
            height: '60px',
            fontSize: '28px',
            cursor: 'pointer',
            border: 'none',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            boxShadow: '0 4px 15px rgba(245, 166, 35, 0.4)'
          }}
        >
          <svg xmlns="http://www.w3.org/2000/svg" style={{ height: '32px', width: '32px', pointerEvents: 'none' }} fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4" />
          </svg>
        </button>
      </div>

      {/* Reporting Panel Wrapper */}
      {isReporting && (
        <ReportForm
          location={crosshairCentre}
          onClose={() => setIsReporting(false)}
        />
      )}
    </div>
  );
};

export default MapView;
