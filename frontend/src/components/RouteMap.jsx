import { MapContainer, TileLayer, Polyline, Marker, Popup } from 'react-leaflet'
import 'leaflet/dist/leaflet.css'
import L from 'leaflet'
import markerIcon from 'leaflet/dist/images/marker-icon.png'
import markerShadow from 'leaflet/dist/images/marker-shadow.png'
import './RouteMap.css'

// Fix default Leaflet marker icon (broken in Vite builds)
L.Icon.Default.mergeOptions({ iconUrl: markerIcon, shadowUrl: markerShadow })

// Colored dot markers for start / pickup / dropoff
function colorIcon(color) {
  return L.divIcon({
    className: '',
    html: `<div style="
      width:14px;height:14px;border-radius:50%;
      background:${color};border:2px solid #fff;
      box-shadow:0 0 6px rgba(0,0,0,0.6);
    "></div>`,
    iconSize: [14, 14],
    iconAnchor: [7, 7],
  })
}

const START_ICON = colorIcon('#4ade80')
const PICKUP_ICON = colorIcon('#60a5fa')
const DROPOFF_ICON = colorIcon('#f87171')


export default function RouteMap({ coords, locations }) {
  if (!coords || coords.length === 0) return null

  const midIndex = Math.floor(coords.length / 2)
  const center = coords[midIndex]

  return (
    <div className="map-wrapper">
      <MapContainer center={center} zoom={6} style={{ height: '100%', width: '100%' }}>
        {/* Dark-style OSM tile layer via CartoDB */}
        <TileLayer
          url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> &copy; <a href="https://carto.com/">CARTO</a>'
          subdomains="abcd"
          maxZoom={19}
        />

        {/* Route polyline */}
        <Polyline positions={coords} color="#3b82f6" weight={3} opacity={0.85} />

        {/* Current location marker */}
        {locations?.current && (
          <Marker
            position={[locations.current.lat, locations.current.lng]}
            icon={START_ICON}
          >
            <Popup>
              <strong>📍 Start</strong><br />{locations.current.label}
            </Popup>
          </Marker>
        )}

        {/* Pickup marker */}
        {locations?.pickup && (
          <Marker
            position={[locations.pickup.lat, locations.pickup.lng]}
            icon={PICKUP_ICON}
          >
            <Popup>
              <strong>📦 Pickup</strong><br />{locations.pickup.label}
            </Popup>
          </Marker>
        )}

        {/* Dropoff marker */}
        {locations?.dropoff && (
          <Marker
            position={[locations.dropoff.lat, locations.dropoff.lng]}
            icon={DROPOFF_ICON}
          >
            <Popup>
              <strong>🏁 Dropoff</strong><br />{locations.dropoff.label}
            </Popup>
          </Marker>
        )}
      </MapContainer>

      {/* Legend */}
      <div className="map-legend">
        <span><span className="dot" style={{ background: '#4ade80' }} /> Start</span>
        <span><span className="dot" style={{ background: '#60a5fa' }} /> Pickup</span>
        <span><span className="dot" style={{ background: '#f87171' }} /> Dropoff</span>
      </div>
    </div>
  )
}
