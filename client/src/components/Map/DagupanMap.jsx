import React, { useEffect, useState, useRef } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Polyline, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { DAGUPAN_CAMPUSES, DAGUPAN_CENTER } from '../../constants/landmarks';
import { Footprints, LocateFixed, Loader2, X } from 'lucide-react';

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

// Custom icon creator for university landmarks
const createCampusIcon = (color) =>
  L.divIcon({
    className: 'custom-campus-icon',
    html: `<div style="background-color: ${color}; width: 28px; height: 28px; border-radius: 50%; display: flex; align-items: center; justify-content: center; border: 2px solid white; box-shadow: 0 2px 5px rgba(0,0,0,0.3); color: white; font-weight: bold; font-size: 11px;">🎓</div>`,
    iconSize: [28, 28],
    iconAnchor: [14, 14],
  });

// Student User Live GPS Location Icon with Pulse Animation
const userLocationIcon = L.divIcon({
  className: 'user-loc-icon',
  html: `<div style="background-color: #2563eb; width: 18px; height: 18px; border-radius: 50%; border: 3px solid white; box-shadow: 0 0 12px rgba(37,99,235,0.8); animation: ping 1.5s cubic-bezier(0, 0, 0.2, 1) infinite;"></div>`,
  iconSize: [18, 18],
  iconAnchor: [9, 9],
});

function MapController({ selectedCampus, selectedListing, userCoords }) {
  const map = useMap();

  useEffect(() => {
    const handleResize = () => {
      map.invalidateSize();
    };
    map.invalidateSize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [map]);

  useEffect(() => {
    if (selectedListing?.location?.coordinates) {
      const [lng, lat] = selectedListing.location.coordinates;
      if (lat && lng) {
        map.flyTo([lat, lng], 17, { duration: 1.2 });
      }
    }
  }, [selectedListing, map]);

  useEffect(() => {
    if (!selectedListing && selectedCampus?.lat && selectedCampus?.lng) {
      map.flyTo([selectedCampus.lat, selectedCampus.lng], 15, { duration: 1.0 });
    }
  }, [selectedCampus, selectedListing, map]);

  return null;
}

// Bottom-Right Locate Me Control Button
function BottomRightLocateControl({ onLocate, isTracking, loading }) {
  return (
    <div className="leaflet-bottom leaflet-right" style={{ marginBottom: '28px', marginRight: '12px' }}>
      <div className="leaflet-control">
        <button
          type="button"
          onClick={onLocate}
          disabled={loading}
          className={`w-10 h-10 rounded-full shadow-lg border flex items-center justify-center transition-all duration-150 hover:scale-105 active:scale-95 cursor-pointer disabled:opacity-75 ${
            isTracking
              ? 'bg-blue-600 text-white border-blue-700 ring-2 ring-blue-400/50'
              : 'bg-white hover:bg-slate-50 text-slate-700 hover:text-emerald-600 border-slate-200'
          }`}
          title="Zoom to My Current GPS Location"
        >
          {loading ? (
            <Loader2 className="w-5 h-5 animate-spin text-emerald-600" />
          ) : (
            <LocateFixed className="w-5 h-5" />
          )}
        </button>
      </div>
    </div>
  );
}

export default function DagupanMap({
  listings = [],
  onSelectListing,
  selectedCampus,
  selectedListing,
  onOpenDetails,
}) {
  const [userLocation, setUserLocation] = useState(null);
  const [isTrackingLive, setIsTrackingLive] = useState(false);
  const [locatingLoading, setLocatingLoading] = useState(false);
  const [routeCoordinates, setRouteCoordinates] = useState([]);
  const [routeInfo, setRouteInfo] = useState(null);
  const [activeTargetHouse, setActiveTargetHouse] = useState(null);
  const [routingLoading, setRoutingLoading] = useState(false);

  const watchIdRef = useRef(null);

  // One-click Locate & Fly
  const handleLocateMe = () => {
    if (!navigator.geolocation) {
      alert('Geolocation is not supported by your browser.');
      return;
    }

    setLocatingLoading(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setLocatingLoading(false);
        const newPos = [pos.coords.latitude, pos.coords.longitude];
        setUserLocation(newPos);
        setIsTrackingLive(true);
      },
      (err) => {
        setLocatingLoading(false);
        console.error('GPS error:', err);
        alert('Could not acquire your GPS location. Please verify browser location permissions.');
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  };

  // Continuous Tracking Setup
  useEffect(() => {
    if (isTrackingLive && !watchIdRef.current) {
      watchIdRef.current = navigator.geolocation.watchPosition(
        (pos) => {
          const newPos = [pos.coords.latitude, pos.coords.longitude];
          setUserLocation(newPos);

          if (activeTargetHouse) {
            fetchWalkingRoute(activeTargetHouse, newPos);
          }
        },
        (err) => console.error('Continuous watch error:', err),
        { enableHighAccuracy: true, maximumAge: 2000, timeout: 10000 }
      );
    }
    return () => {
      if (watchIdRef.current !== null) {
        navigator.geolocation.clearWatch(watchIdRef.current);
        watchIdRef.current = null;
      }
    };
  }, [isTrackingLive, activeTargetHouse]);

  // Fetch free OSRM Foot Walking Path
  const fetchWalkingRoute = async (targetHouse, fromCoords = null) => {
    const destCoords = targetHouse?.location?.coordinates;
    if (!destCoords) return;

    setActiveTargetHouse(targetHouse);

    const currentCoords = fromCoords || userLocation;
    const startLat = currentCoords ? currentCoords[0] : selectedCampus.lat;
    const startLng = currentCoords ? currentCoords[1] : selectedCampus.lng;
    const endLng = destCoords[0];
    const endLat = destCoords[1];

    setRoutingLoading(true);
    try {
      const osrmUrl = `https://router.project-osrm.org/route/v1/foot/${startLng},${startLat};${endLng},${endLat}?geometries=geojson&overview=full`;
      const response = await fetch(osrmUrl);
      const data = await response.json();

      if (data.code === 'Ok' && data.routes?.length > 0) {
        const route = data.routes[0];
        const latLngs = route.geometry.coordinates.map((coord) => [coord[1], coord[0]]);
        setRouteCoordinates(latLngs);
        setRouteInfo({
          distanceMeters: Math.round(route.distance),
          durationMins: Math.round(route.duration / 60),
          targetTitle: targetHouse.title || targetHouse.name,
          originName: currentCoords ? 'Live GPS Location' : selectedCampus.name.split(' ')[0],
        });
      } else {
        alert('Could not trace a walkable foot path for this location.');
      }
    } catch (err) {
      console.error('OSRM route error:', err);
    } finally {
      setRoutingLoading(false);
    }
  };

  const clearRoute = () => {
    setRouteCoordinates([]);
    setRouteInfo(null);
    setActiveTargetHouse(null);
  };

  return (
    <div className="relative z-0 w-full h-full rounded-2xl overflow-hidden shadow-md border border-slate-200">
      {/* Multi-Modal Commute Estimator Banner */}
      {routeInfo && (
        <div className="absolute bottom-5 left-1/2 -translate-x-1/2 z-[400] bg-white/95 backdrop-blur-md px-4 py-3 rounded-2xl shadow-xl border border-emerald-500/40 w-11/12 max-w-md">
          <div className="flex items-center justify-between mb-2">
            <div>
              <p className="text-xs font-bold text-slate-900 leading-tight">
                Transit Estimator: {routeInfo.targetTitle}
              </p>
              <p className="text-[10px] text-slate-500">
                {routeInfo.distanceMeters} meters from {routeInfo.originName}
              </p>
            </div>
            <button
              type="button"
              onClick={clearRoute}
              className="p-1 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100 transition cursor-pointer"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Dagupan Travel Mode Comparison Badges */}
          <div className="grid grid-cols-4 gap-1.5 text-center pt-1 border-t border-slate-100">
            <div className="p-1.5 rounded-lg bg-emerald-50 text-emerald-800">
              <span className="text-sm">🚶</span>
              <p className="text-[11px] font-bold mt-0.5">
                {Math.max(1, Math.round(routeInfo.distanceMeters / 75))} min
              </p>
              <p className="text-[9px] text-emerald-600 uppercase font-semibold">Walk</p>
            </div>

            <div className="p-1.5 rounded-lg bg-cyan-50 text-cyan-800">
              <span className="text-sm">🚲</span>
              <p className="text-[11px] font-bold mt-0.5">
                {Math.max(1, Math.round(routeInfo.distanceMeters / 250))} min
              </p>
              <p className="text-[9px] text-cyan-600 uppercase font-semibold">Bike</p>
            </div>

            <div className="p-1.5 rounded-lg bg-amber-50 text-amber-800">
              <span className="text-sm">🛵</span>
              <p className="text-[11px] font-bold mt-0.5">
                {Math.max(1, Math.round(routeInfo.distanceMeters / 450))} min
              </p>
              <p className="text-[9px] text-amber-600 uppercase font-semibold">Motor</p>
            </div>

            <div className="p-1.5 rounded-lg bg-indigo-50 text-indigo-800">
              <span className="text-sm">🚐</span>
              <p className="text-[11px] font-bold mt-0.5">
                {Math.max(2, Math.round(routeInfo.distanceMeters / 300) + 2)} min
              </p>
              <p className="text-[9px] text-indigo-600 uppercase font-semibold">Jeep/Bus</p>
            </div>
          </div>
        </div>
      )}

      <MapContainer
        center={selectedCampus ? [selectedCampus.lat, selectedCampus.lng] : DAGUPAN_CENTER}
        zoom={15}
        scrollWheelZoom={true}
        className="w-full h-full min-h-[350px] z-0"
      >
        <MapController
          selectedCampus={selectedCampus}
          selectedListing={selectedListing}
          userCoords={userLocation}
        />

        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        {/* User GPS Location Marker */}
        {userLocation && (
          <Marker position={userLocation} icon={userLocationIcon}>
            <Popup>
              <div className="text-xs font-bold text-blue-600">
                {isTrackingLive ? 'Live GPS Location (Active)' : 'You are here'}
              </div>
            </Popup>
          </Marker>
        )}

        {/* Free OSRM Walking Polyline Path */}
        {routeCoordinates.length > 0 && (
          <Polyline
            positions={routeCoordinates}
            pathOptions={{
              color: '#059669',
              weight: 5,
              opacity: 0.85,
              dashArray: '8, 8',
            }}
          />
        )}

        {/* University Landmark Markers */}
        {DAGUPAN_CAMPUSES.map((campus) => (
          <Marker
            key={campus.id}
            position={[campus.lat, campus.lng]}
            icon={createCampusIcon(campus.color)}
          >
            <Popup>
              <div className="text-sm font-semibold text-slate-800">
                🎓 {campus.name}
              </div>
            </Popup>
          </Marker>
        ))}

        {/* Boarding House Listings */}
        {listings.map((item) => {
          const [lng, lat] = item.location?.coordinates || [];
          if (!lat || !lng) return null;

          const displayTitle = item.title || item.name;
          const displayAddress =
            typeof item.address === 'object' && item.address !== null
              ? `${item.address.street || ''}, ${item.address.barangay || ''}`
              : item.address;

          return (
            <Marker
              key={item._id}
              position={[lat, lng]}
              eventHandlers={{
                click: () => onSelectListing && onSelectListing(item),
              }}
            >
              <Popup>
                <div className="p-1 max-w-[210px] space-y-2">
                  <div>
                    <h4 className="font-bold text-slate-900 text-sm leading-snug">{displayTitle}</h4>
                    <p className="text-emerald-600 font-bold text-xs mt-0.5">
                      ₱{item.monthlyRent?.toLocaleString()} / month
                    </p>
                    <p className="text-slate-500 text-[11px] mt-0.5 truncate">{displayAddress}</p>
                  </div>

                  <div className="flex items-center gap-1.5 pt-1 border-t border-slate-100">
                    <button
                      type="button"
                      onClick={() => fetchWalkingRoute(item)}
                      disabled={routingLoading}
                      className="flex-1 flex items-center justify-center gap-1 py-1 px-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-md text-[10px] font-semibold transition cursor-pointer"
                    >
                      <Footprints className="w-3 h-3" />
                      Walk Route
                    </button>

                    {onOpenDetails && (
                      <button
                        type="button"
                        onClick={() => onOpenDetails(item)}
                        className="py-1 px-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-md text-[10px] font-semibold transition cursor-pointer"
                      >
                        Details
                      </button>
                    )}
                  </div>
                </div>
              </Popup>
            </Marker>
          );
        })}

        {/* The Bottom-Right Locate Me Control Button */}
        <BottomRightLocateControl
          onLocate={handleLocateMe}
          isTracking={isTrackingLive}
          loading={locatingLoading}
        />
      </MapContainer>
    </div>
  );
}