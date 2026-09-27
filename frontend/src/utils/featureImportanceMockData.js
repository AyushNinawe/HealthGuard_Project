/**
 * Mock feature importance data for the FeatureImportanceChart
 * Returned by the AI model alongside a PredictionResult
 */
export const MOCK_FEATURE_IMPORTANCE = [
  { feature: 'Claim Amount vs Avg',   importance: 0.28 },
  { feature: 'Policy Age (days)',     importance: 0.21 },
  { feature: 'Prior Claims Count',    importance: 0.17 },
  { feature: 'Hospital Risk Score',   importance: 0.14 },
  { feature: 'Incident Location',     importance: 0.09 },
  { feature: 'Time to First Claim',   importance: 0.06 },
  { feature: 'Claim Type Risk',       importance: 0.03 },
  { feature: 'Document Count',        importance: 0.02 },
]
