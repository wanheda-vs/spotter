import axios from 'axios'

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:8000/api'

/**
 * POST /api/plan/
 * @param {Object} formData
 * @param {string} formData.current_location
 * @param {string} formData.pickup_location
 * @param {string} formData.dropoff_location
 * @param {number} formData.current_cycle_used
 */
export async function planTrip(formData) {
  // TODO: nothing to change here — just call the endpoint.
  // The backend returns the shape defined in TripResultSerializer.
  const response = await axios.post(`${API_BASE}/plan/`, formData)
  return response.data
}
