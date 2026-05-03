import './StopsList.css'

const ICONS = {
  pickup: '📦',
  dropoff: '🏁',
  rest: '🛏️',
  fuel: '⛽',
  break: '☕',
}

const TYPE_CLASS = {
  pickup: 'type-pickup',
  dropoff: 'type-dropoff',
  rest: 'type-rest',
  fuel: 'type-fuel',
  break: 'type-break',
}

export default function StopsList({ stops }) {
  if (!stops || stops.length === 0) return null
  return (
    <section className="stops-section">
      <p className="section-title">Trip Stops</p>
      <div className="stops-grid">
        {stops.map((stop, i) => (
          <div key={i} className={`stop-card ${TYPE_CLASS[stop.type] || ''}`}>
            <div className="stop-icon">{ICONS[stop.type] || '📍'}</div>
            <div className="stop-body">
              <div className="stop-type">{stop.type.toUpperCase()}</div>
              <div className="stop-location">{stop.location}</div>
              <div className="stop-times">
                <span>{stop.arrival_time}</span>
                <span className="arrow">→</span>
                <span>{stop.departure_time}</span>
                <span className="stop-duration">({stop.duration_hours}h)</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  )
}
