/**
 * AIFraudDetection page — /ai/fraud-detection
 * Submit a claim for real-time AI fraud analysis
 */
import { useState, useEffect } from 'react'
import {
  Chart as ChartJS, BarElement, CategoryScale, LinearScale, Tooltip, Legend,
} from 'chart.js'
import {
  FiCpu, FiRefreshCw, FiAlertTriangle, FiSearch, FiEdit3,
} from 'react-icons/fi'
import aiService from '../../services/aiService'
import useAIPrediction from '../../hooks/useAIPrediction'
import { useToast } from '../../hooks/useToast'
import FraudGauge         from '../../components/ai/FraudGauge'
import AIPredictionCard   from '../../components/ai/AIPredictionCard'
import RiskMeter          from '../../components/ai/RiskMeter'
import ExplainableAI      from '../../components/ai/ExplainableAI'
import FeatureImportanceChart from '../../components/ai/FeatureImportanceChart'
import RecommendationPanel from '../../components/ai/RecommendationPanel'
import DocumentViewer     from '../../components/ai/DocumentViewer'
import PredictionHistoryTable from '../../components/ai/PredictionHistoryTable'
import LoadingSkeleton    from '../../components/ai/LoadingSkeleton'
import LoadingSpinner     from '../../components/common/LoadingSpinner'
import Alert              from '../../components/common/Alert'
import { MOCK_PREDICTION_HISTORY } from '../../utils/aiMockData'
import { MOCK_FEATURE_IMPORTANCE } from '../../utils/featureImportanceMockData'
import { CLAIM_TYPES }   from '../../utils/constants'

ChartJS.register(BarElement, CategoryScale, LinearScale, Tooltip, Legend)

const INITIAL_FORM = {
  claimId: '', patientName: '', claimAmount: '',
  claimType: 'Medical', hospital: '', incidentDate: '',
  policyNumber: '', incidentDescription: '',
}

export default function AIFraudDetection() {
  const [inputMode,      setInputMode]      = useState('id')
  const [form,           setForm]           = useState(INITIAL_FORM)
  const [files,          setFiles]          = useState([])
  const [errors,         setErrors]         = useState({})
  const [historyData,    setHistoryData]    = useState([])
  const [historyLoading, setHistoryLoading] = useState(true)

  const { result, loading, error, submit, reset } = useAIPrediction()
  const { addToast } = useToast()

  // Load prediction history on mount
  useEffect(() => {
    aiService.getPredictionHistory({ page: 1, limit: 50 })
      .then(d => {
        const list = Array.isArray(d) ? d : (d?.data || d?.items || [])
        setHistoryData(Array.isArray(list) ? list : MOCK_PREDICTION_HISTORY)
      })
      .catch(() => setHistoryData(MOCK_PREDICTION_HISTORY))
      .finally(() => setHistoryLoading(false))
  }, [])

  function setField(key, val) {
    setForm(prev => ({ ...prev, [key]: val }))
    if (errors[key]) setErrors(prev => { const n = { ...prev }; delete n[key]; return n })
  }

  function validate() {
    const e = {}
    if (inputMode === 'id') {
      if (!form.claimId.trim()) e.claimId = 'Claim ID is required'
    } else {
      if (!form.patientName.trim())    e.patientName    = 'Patient name is required'
      if (!form.claimAmount || Number(form.claimAmount) <= 0) e.claimAmount = 'Enter a valid amount > 0'
      if (!form.hospital.trim())       e.hospital       = 'Hospital is required'
      if (!form.incidentDate)          e.incidentDate   = 'Incident date is required'
      if (!form.policyNumber.trim())   e.policyNumber   = 'Policy number is required'
    }
    return e
  }

  async function handleSubmit() {
    const e = validate()
    if (Object.keys(e).length > 0) { setErrors(e); return }
    const fd = new FormData()
    if (inputMode === 'id') {
      fd.append('claimId', form.claimId)
    } else {
      Object.entries(form).forEach(([k, v]) => { if (k !== 'claimId') fd.append(k, v) })
    }
    files.forEach(f => fd.append('documents', f))
    await submit(fd)
    addToast('Prediction complete', 'success')
  }

  function handleReset() {
    reset()
    setForm(INITIAL_FORM)
    setFiles([])
    setErrors({})
  }

  function handleRefreshHistory() {
    setHistoryLoading(true)
    aiService.getPredictionHistory({ page: 1, limit: 50 })
      .then(d => {
        const list = Array.isArray(d) ? d : (d?.data || d?.items || [])
        setHistoryData(Array.isArray(list) ? list : MOCK_PREDICTION_HISTORY)
      })
      .catch(() => setHistoryData(MOCK_PREDICTION_HISTORY))
      .finally(() => setHistoryLoading(false))
  }

  const featureData = result?.featureImportance?.length
    ? result.featureImportance
    : MOCK_FEATURE_IMPORTANCE

  return (
    <div className="animate-fade-in">
      {/* Page header */}
      <div className="page-header">
        <h1>🤖 AI Fraud Detection</h1>
        <p>Submit a claim for real-time AI-powered fraud analysis</p>
      </div>

      {/* Two-column layout */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem', marginBottom: '1.5rem' }}>

        {/* ── LEFT: Input form ── */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>

          {/* Input mode toggle + form */}
          <div className="data-card">
            <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.25rem' }}>
              <button
                className={`btn-hg ${inputMode === 'id' ? 'btn-primary-hg' : 'btn-outline-hg'}`}
                onClick={() => { setInputMode('id'); setErrors({}) }}
              >
                <FiSearch size={14} /> By Claim ID
              </button>
              <button
                className={`btn-hg ${inputMode === 'manual' ? 'btn-primary-hg' : 'btn-outline-hg'}`}
                onClick={() => { setInputMode('manual'); setErrors({}) }}
              >
                <FiEdit3 size={14} /> Manual Entry
              </button>
            </div>

            {inputMode === 'id' ? (
              <div>
                <label className="form-label-hg">Claim ID *</label>
                <input
                  className={`form-control-hg${errors.claimId ? ' is-invalid' : ''}`}
                  placeholder="e.g. CLM-2026-001"
                  value={form.claimId}
                  onChange={e => setField('claimId', e.target.value)}
                />
                {errors.claimId && <div className="form-error">{errors.claimId}</div>}
              </div>
            ) : (
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.875rem' }}>
                {/* Patient Name */}
                <div>
                  <label className="form-label-hg">Patient Name *</label>
                  <input className={`form-control-hg${errors.patientName ? ' is-invalid' : ''}`}
                    placeholder="Full name" value={form.patientName}
                    onChange={e => setField('patientName', e.target.value)} />
                  {errors.patientName && <div className="form-error">{errors.patientName}</div>}
                </div>
                {/* Claim Amount */}
                <div>
                  <label className="form-label-hg">Claim Amount ($) *</label>
                  <input type="number" min="1"
                    className={`form-control-hg${errors.claimAmount ? ' is-invalid' : ''}`}
                    placeholder="0.00" value={form.claimAmount}
                    onChange={e => setField('claimAmount', e.target.value)} />
                  {errors.claimAmount && <div className="form-error">{errors.claimAmount}</div>}
                </div>
                {/* Claim Type */}
                <div>
                  <label className="form-label-hg">Claim Type</label>
                  <select className="form-control-hg" value={form.claimType}
                    onChange={e => setField('claimType', e.target.value)}>
                    {CLAIM_TYPES.map(t => <option key={t}>{t}</option>)}
                  </select>
                </div>
                {/* Hospital */}
                <div>
                  <label className="form-label-hg">Hospital *</label>
                  <input className={`form-control-hg${errors.hospital ? ' is-invalid' : ''}`}
                    placeholder="Hospital name" value={form.hospital}
                    onChange={e => setField('hospital', e.target.value)} />
                  {errors.hospital && <div className="form-error">{errors.hospital}</div>}
                </div>
                {/* Incident Date */}
                <div>
                  <label className="form-label-hg">Incident Date *</label>
                  <input type="date"
                    className={`form-control-hg${errors.incidentDate ? ' is-invalid' : ''}`}
                    value={form.incidentDate}
                    onChange={e => setField('incidentDate', e.target.value)} />
                  {errors.incidentDate && <div className="form-error">{errors.incidentDate}</div>}
                </div>
                {/* Policy Number */}
                <div>
                  <label className="form-label-hg">Policy Number *</label>
                  <input className={`form-control-hg${errors.policyNumber ? ' is-invalid' : ''}`}
                    placeholder="POL-XXXXX" value={form.policyNumber}
                    onChange={e => setField('policyNumber', e.target.value)} />
                  {errors.policyNumber && <div className="form-error">{errors.policyNumber}</div>}
                </div>
                {/* Description — full width */}
                <div style={{ gridColumn: '1 / -1' }}>
                  <label className="form-label-hg">Incident Description</label>
                  <textarea className="form-control-hg" rows={3}
                    placeholder="Describe the incident…"
                    value={form.incidentDescription}
                    onChange={e => setField('incidentDescription', e.target.value)}
                    style={{ resize: 'vertical' }} />
                </div>
              </div>
            )}
          </div>

          {/* Document upload */}
          <div className="data-card">
            <h6 style={{ fontWeight: 700, marginBottom: '0.875rem' }}>Supporting Documents</h6>
            <DocumentViewer files={files} onChange={setFiles} maxFiles={5} />
          </div>

          {/* Submit / reset */}
          <div style={{ display: 'flex', gap: '0.75rem' }}>
            <button
              className="btn-hg btn-primary-hg btn-lg-hg"
              onClick={handleSubmit}
              disabled={loading}
              style={{ flex: 1 }}
            >
              {loading
                ? <><LoadingSpinner size="sm" /> Analyzing…</>
                : <><FiCpu size={16} /> Run AI Analysis</>
              }
            </button>
            {result && (
              <button className="btn-hg btn-secondary-hg" onClick={handleReset}>
                <FiRefreshCw size={14} /> New
              </button>
            )}
          </div>

          {error && <Alert type="error" message={error} onDismiss={() => {}} />}
        </div>

        {/* ── RIGHT: Result panel ── */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          {loading ? (
            <>
              <LoadingSkeleton type="card" rows={3} />
              <LoadingSkeleton type="chart" height={200} />
            </>
          ) : result ? (
            <>
              <AIPredictionCard
                prediction={result.prediction}
                fraudProbability={result.fraudProbability}
                confidenceScore={result.confidenceScore}
                riskLevel={result.riskLevel}
                modelName={result.modelName}
                modelVersion={result.modelVersion}
                timestamp={result.predictionTimestamp}
              />

              {/* Gauge + Risk Meter */}
              <div className="data-card" style={{ display: 'flex', gap: '1.5rem', alignItems: 'center', justifyContent: 'center', flexWrap: 'wrap' }}>
                <FraudGauge value={result.fraudProbability} size={170} />
                <div style={{ flex: 1, minWidth: 180 }}>
                  <div style={{ fontWeight: 700, fontSize: '0.85rem', marginBottom: '0.75rem', color: 'var(--text-primary)' }}>
                    Risk Meter
                  </div>
                  <RiskMeter value={result.fraudProbability} size="lg" />
                </div>
              </div>

              <RecommendationPanel
                recommendation={result.recommendation}
                recommendedAction={result.recommendedAction}
              />

              <ExplainableAI reasons={result.reasons} />

              <div className="data-card">
                <h6 style={{ fontWeight: 700, marginBottom: '0.875rem' }}>Feature Importance</h6>
                <FeatureImportanceChart features={featureData} height={240} />
              </div>
            </>
          ) : (
            /* Empty state */
            <div className="data-card" style={{
              display: 'flex', flexDirection: 'column', alignItems: 'center',
              justifyContent: 'center', gap: '1rem', padding: '3rem',
              textAlign: 'center', minHeight: 300, color: 'var(--text-muted)',
            }}>
              <FiAlertTriangle size={52} style={{ opacity: 0.25 }} />
              <h6 style={{ fontWeight: 600, color: 'var(--text-secondary)' }}>No Analysis Yet</h6>
              <p style={{ fontSize: '0.875rem', maxWidth: 260 }}>
                Fill in the claim details on the left and click "Run AI Analysis" to see the prediction here.
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Prediction history (full width) */}
      <div className="data-card">
        <h6 style={{ fontWeight: 700, marginBottom: '1rem' }}>Prediction History</h6>
        <PredictionHistoryTable
          data={historyData}
          loading={historyLoading}
          onRefresh={handleRefreshHistory}
        />
      </div>
    </div>
  )
}
