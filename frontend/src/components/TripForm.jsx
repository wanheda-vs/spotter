import { useState } from 'react'
import './TripForm.css'

export default function TripForm({ onSubmit, loading }) {
  const [form, setForm] = useState({
    current_location: '',
    pickup_location: '',
    dropoff_location: '',
    current_cycle_used: '',
  })

  function handleChange(e) {
    setForm({ ...form, [e.target.name]: e.target.value })
  }

  function handleSubmit(e) {
    e.preventDefault()
    onSubmit({ ...form, current_cycle_used: parseFloat(form.current_cycle_used) })
  }

  return (
    <form className="trip-form" onSubmit={handleSubmit}>
      <div className="form-grid">
        <div className="form-field">
          <label>Current Location</label>
          <input
            name="current_location"
            placeholder="e.g. Chicago, IL"
            value={form.current_location}
            onChange={handleChange}
            required
          />
        </div>

        <div className="form-field">
          <label>Pickup Location</label>
          <input
            name="pickup_location"
            placeholder="e.g. St. Louis, MO"
            value={form.pickup_location}
            onChange={handleChange}
            required
          />
        </div>

        <div className="form-field">
          <label>Dropoff Location</label>
          <input
            name="dropoff_location"
            placeholder="e.g. Dallas, TX"
            value={form.dropoff_location}
            onChange={handleChange}
            required
          />
        </div>

        <div className="form-field">
          <label>Current Cycle Used <span className="label-hint">(0 – 70 hrs)</span></label>
          <input
            name="current_cycle_used"
            type="number"
            min="0"
            max="70"
            step="0.5"
            placeholder="e.g. 24"
            value={form.current_cycle_used}
            onChange={handleChange}
            required
          />
        </div>
      </div>

      <button className="submit-btn" type="submit" disabled={loading}>
        {loading ? (
          <><span className="spinner" /> Planning route…</>
        ) : (
          'Plan Trip'
        )}
      </button>
    </form>
  )
}
