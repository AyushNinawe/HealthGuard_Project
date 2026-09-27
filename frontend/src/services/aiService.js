/**
 * AI Module — Axios service layer
 * All AI-related API calls are isolated here.
 */
import api from './api'

// ── AI Prediction ──────────────────────────────────────────────
export const aiService = {
  /**
   * POST /predict
   * Send claim data + optional documents → PredictionResult
   */
  predict: (formData) =>
    api.post('/predict', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }).then((r) => r.data),

  /**
   * GET /prediction-history?page=&limit=&search=&filter=
   * Returns paginated list of past AI predictions
   */
  getPredictionHistory: (params) =>
    api.get('/prediction-history', { params }).then((r) => r.data),

  /**
   * GET /analytics
   * Returns aggregated AI analytics data
   */
  getAnalytics: () => api.get('/analytics').then((r) => r.data),

  /**
   * GET /model-info
   * Returns current model metadata
   */
  getModelInfo: () => api.get('/model-info').then((r) => r.data),

  /**
   * POST /upload-documents (multipart/form-data)
   * Upload claim documents before prediction
   */
  uploadDocuments: (formData) =>
    api.post('/upload-documents', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }).then((r) => r.data),

  /**
   * POST /retrain-model  [Admin only]
   * Trigger model retraining on the backend
   */
  retrainModel: (payload) =>
    api.post('/retrain-model', payload).then((r) => r.data),

  /**
   * GET /reports
   * Download/export prediction reports
   */
  getReports: (params) => api.get('/reports', { params }).then((r) => r.data),
}

export default aiService
