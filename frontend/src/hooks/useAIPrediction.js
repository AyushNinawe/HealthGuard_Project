/**
 * useAIPrediction — encapsulates AI prediction lifecycle
 * loading / error / result / submit / reset
 */
import { useState } from 'react'
import aiService from '../services/aiService'
import { MOCK_PREDICTION_RESULT } from '../utils/aiMockData'

export function useAIPrediction() {
  const [result, setResult]   = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError]     = useState(null)
  const [inFlight, setInFlight] = useState(false)

  async function submit(formData) {
    if (inFlight) return          // guard against concurrent calls
    setInFlight(true)
    setLoading(true)
    setError(null)
    try {
      const data = await aiService.predict(formData)
      setResult(data)
    } catch (err) {
      if (!err.response) {
        // Network unavailable → demo fallback
        setResult(MOCK_PREDICTION_RESULT)
      } else {
        setError(err.response?.data?.message || 'Prediction failed. Please try again.')
      }
    } finally {
      setLoading(false)
      setInFlight(false)
    }
  }

  function reset() {
    setResult(null)
    setError(null)
    setLoading(false)
  }

  return { result, loading, error, submit, reset }
}

export default useAIPrediction
