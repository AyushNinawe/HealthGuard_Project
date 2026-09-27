/**
 * AI Module — Mock data
 * Used as demo fallback when no backend is connected.
 */

export const MOCK_PREDICTION_RESULT = {
  predictionId: 'PRED-20260713-001',
  prediction: 'Fraud',
  fraudProbability: 0.92,
  genuineProbability: 0.08,
  confidenceScore: 0.96,
  riskLevel: 'Critical',
  modelName: 'Random Forest Classifier',
  modelVersion: 'v2.4.1',
  predictionTimestamp: new Date().toISOString(),
  reasons: [
    'Claim amount is 340% above the category average',
    'Policy purchased only 10 days before the incident',
    'Customer has submitted 5 prior claims in 12 months',
    'No police report filed for a major incident',
    'Hospital name appears in 3 previous fraud cases',
    'Incident location inconsistent with policy address',
  ],
  recommendedAction: 'High Fraud Risk — Reject Claim',
  recommendation: 'reject',
  claimSummary: {},
}

export const MOCK_PREDICTION_HISTORY = Array.from({ length: 28 }, (_, i) => ({
  predictionId: `PRED-2026-${String(i + 1).padStart(3, '0')}`,
  customerName: [
    'Sarah Johnson', 'Mike Chen', 'Priya Patel', 'James Wilson',
    'Amara Osei', 'Tom Baker', 'Lisa Nguyen', 'Robert Kim',
  ][i % 8],
  customerId: `CUST-${String(i + 100).padStart(4, '0')}`,
  fraudProbability: parseFloat((Math.random()).toFixed(2)),
  prediction: i % 4 === 0 ? 'Fraud' : 'Genuine',
  riskLevel: ['Low', 'Medium', 'High', 'Critical'][i % 4],
  claimAmount: [12500, 8200, 5600, 35000, 7100, 22000, 3400, 15600][i % 8],
  claimType: ['Medical', 'Vehicle', 'Life', 'Property'][i % 4],
  createdAt: new Date(Date.now() - i * 86400000).toISOString(),
}))

export const MOCK_ANALYTICS = {
  summary: {
    totalAnalysed: 1284,
    fraudDetected: 198,
    genuineClaims: 1086,
    avgFraudScore: 0.34,
    avgProcessingTime: 1.8, // seconds
    accuracyRate: 0.967,
  },
  fraudVsGenuine: { fraud: 198, genuine: 1086 },
  monthlyTrend: [
    { month: 'Aug', fraud: 14, genuine: 72 },
    { month: 'Sep', fraud: 18, genuine: 89 },
    { month: 'Oct', fraud: 22, genuine: 101 },
    { month: 'Nov', fraud: 16, genuine: 88 },
    { month: 'Dec', fraud: 12, genuine: 67 },
    { month: 'Jan', fraud: 19, genuine: 94 },
    { month: 'Feb', fraud: 24, genuine: 108 },
    { month: 'Mar', fraud: 17, genuine: 96 },
    { month: 'Apr', fraud: 21, genuine: 112 },
    { month: 'May', fraud: 15, genuine: 98 },
    { month: 'Jun', fraud: 11, genuine: 83 },
    { month: 'Jul', fraud: 9, genuine: 78 },
  ],
  claimAmountDist: [
    { range: '$0–5k',   count: 312 },
    { range: '$5–10k',  count: 418 },
    { range: '$10–25k', count: 289 },
    { range: '$25–50k', count: 178 },
    { range: '$50k+',   count: 87 },
  ],
  topRegions: [
    { region: 'California', fraudCount: 42 },
    { region: 'Texas',      fraudCount: 31 },
    { region: 'Florida',    fraudCount: 28 },
    { region: 'New York',   fraudCount: 24 },
    { region: 'Illinois',   fraudCount: 19 },
  ],
  topHospitals: [
    { hospital: 'City General',   fraudCount: 18 },
    { hospital: 'Metro Health',   fraudCount: 14 },
    { hospital: 'Valley Medical', fraudCount: 11 },
    { hospital: 'Sunrise Clinic', fraudCount: 9 },
    { hospital: 'Bay Area Hosp.', fraudCount: 7 },
  ],
  fraudByType: [
    { type: 'Medical',  count: 98 },
    { type: 'Vehicle',  count: 54 },
    { type: 'Life',     count: 29 },
    { type: 'Property', count: 17 },
  ],
  riskDistribution: [
    { level: 'Low',      count: 632 },
    { level: 'Medium',   count: 398 },
    { level: 'High',     count: 187 },
    { level: 'Critical', count: 67 },
  ],
}

export const MOCK_MODEL_INFO = {
  currentModel: 'Random Forest Classifier',
  modelVersion: 'v2.4.1',
  trainingAccuracy: 0.974,
  precision: 0.968,
  recall: 0.961,
  f1Score: 0.964,
  rocAuc: 0.991,
  datasetSize: 124850,
  lastTrained: '2026-06-15T08:30:00Z',
  features: 47,
  trees: 200,
  status: 'Active',
}

export const RECOMMENDATION_CONFIG = {
  approve:     { label: 'Approve Automatically',      color: '#2E7D32', bg: '#E8F5E9', border: '#A5D6A7' },
  investigate: { label: 'Manual Investigation Required', color: '#E65100', bg: '#FFF8E1', border: '#FFE082' },
  high_risk:   { label: 'High Fraud Risk — Review',   color: '#BF360C', bg: '#FFF3E0', border: '#FFCC80' },
  reject:      { label: 'Reject Claim',               color: '#B71C1C', bg: '#FFEBEE', border: '#EF9A9A' },
}
