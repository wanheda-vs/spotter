import { useState } from 'react'
import TripForm from './components/TripForm'
import RouteMap from './components/RouteMap'
import StopsList from './components/StopsList'
import LogSheet from './components/LogSheet'
import { planTrip } from './api/tripApi'
import './App.css'

export default function App() {
  const [result, setResult] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  async function handleSubmit(formData) {
    setLoading(true)
    setError(null)
    setResult(null)
    try {
      const data = await planTrip(formData)
      setResult(data)
    } catch (err) {
      setError(err.response?.data?.error || err.message || 'Something went wrong.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="app">
      <header className="app-header">
        <p>Enter trip details to generate your HOS-compliant route and daily log sheets.</p>
      </header>

      <main>
        <TripForm onSubmit={handleSubmit} loading={loading} />

        {error && <p className="error-msg">⚠ {error}</p>}

        {result && (
          <>
            {/* Summary bar */}
            <div className="trip-summary">
              <div className="stat">
                <span className="stat-label">Total Distance</span>
                <span className="stat-value">{result.total_distance_miles.toLocaleString()} mi</span>
              </div>
              <div className="stat">
                <span className="stat-label">Total Duration</span>
                <span className="stat-value">{result.total_duration_hours} hrs</span>
              </div>
              <div className="stat">
                <span className="stat-label">Stops</span>
                <span className="stat-value">{result.stops.length}</span>
              </div>
              <div className="stat">
                <span className="stat-label">Days on Log</span>
                <span className="stat-value">{result.daily_logs.length}</span>
              </div>
            </div>

            <RouteMap
              coords={result.route_coords}
              locations={result.locations}
              stops={result.stops}
            />

            <StopsList stops={result.stops} />

            <p className="section-title" style={{ marginTop: '2rem' }}>Daily Log Sheets</p>
            {result.daily_logs.map((log, i) => (
              <LogSheet key={i} log={log} />
            ))}
          </>
        )}
      </main>
    </div>
  )
}
