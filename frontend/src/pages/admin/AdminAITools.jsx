/**
 * AdminAITools page — /admin/ai-tools
 * Admin-only: Retrain Model, Upload Dataset, Model Info, Logs, Export Predictions
 */
import { useState, useEffect, useRef } from 'react'
import { Navigate } from 'react-router-dom'
import {
  FiRefreshCw, FiUpload, FiDownload, FiTerminal,
  FiAlertTriangle, FiCheckCircle,
} from 'react-icons/fi'
import { useAuth }      from '../../context/AuthContext'
import { useToast }     from '../../hooks/useToast'
import aiService        from '../../services/aiService'
import ModelInfoCard    from '../../components/ai/ModelInfoCard'
import DocumentViewer   from '../../components/ai/DocumentViewer'
import LoadingSkeleton  from '../../components/ai/LoadingSkeleton'
import Alert            from '../../components/common/Alert'
import { MOCK_MODEL_INFO } from '../../utils/aiMockData'

// Mock logs
const INITIAL_LOGS = [
  '[2026-07-13 09:12:04] Model v2.4.1 loaded successfully',
  '[2026-07-13 09:12:05] Prediction service started on port 8001',
  '[2026-07-13 09:14:22] PRED-001: fraud_prob=0.92, result=Fraud, latency=1.2s',
  '[2026-07-13 09:17:55] PRED-002: fraud_prob=0.14, result=Genuine, latency=0.9s',
  '[2026-07-13 09:23:11] PRED-003: fraud_prob=0.78, result=Fraud, latency=1.1s',
  '[2026-07-13 09:31:47] Health check OK — model ready',
]

export default function AdminAITools() {
  const { user }         = useAuth()
  const { addToast }     = useToast()
  const logsEndRef       = useRef()

  const [modelInfo,   setModelInfo]   = useState(null)
  const [modelLoading, setModelLoading] = useState(true)
  const [retraining,  setRetraining]  = useState(false)
  const [retrainDone, setRetrainDone] = useState(false)
  const [retrainError, setRetrainError] = useState('')
  const [datasetFiles, setDatasetFiles] = useState([])
  const [uploading,   setUploading]   = useState(false)
  const [uploadDone,  setUploadDone]  = useState(false)
  const [logs,        setLogs]        = useState(INITIAL_LOGS)

  // Double guard — admin only
  if (user?.role !== 'admin') return <Navigate to="/dashboard" replace />

  useEffect(() => {
    aiService.getModelInfo()
      .then(setModelInfo)
      .catch(() => setModelInfo(MOCK_MODEL_INFO))
      .finally(() => setModelLoading(false))
  }, [])

  // Auto-scroll logs
  useEffect(() => {
    logsEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [logs])

  async function handleRetrain() {
    setRetraining(true)
    setRetrainError('')
    setRetrainDone(false)
    try {
      await aiService.retrainModel()
      setRetrainDone(true)
      addToast('Model retraining started successfully', 'success')
      setLogs(prev => [...prev, `[${new Date().toISOString().replace('T',' ').slice(0,19)}] Retraining triggered by admin`])
    } catch {
      // Demo mode
      setRetrainDone(true)
      addToast('Retraining triggered (demo mode)', 'info')
      setLogs(prev => [...prev, `[${new Date().toISOString().replace('T',' ').slice(0,19)}] Retraining triggered — demo mode`])
    } finally {
      setRetraining(false)
    }
  }

  async function handleUpload() {
    if (!datasetFiles.length) return
    setUploading(true)
    setUploadDone(false)
    await new Promise(r => setTimeout(r, 1500)) // simulate upload
    setUploading(false)
    setUploadDone(true)
    addToast(`Dataset (${datasetFiles[0].name}) uploaded`, 'success')
    setLogs(prev => [...prev, `[${new Date().toISOString().replace('T',' ').slice(0,19)}] Dataset uploaded: ${datasetFiles[0].name}`])
    setDatasetFiles([])
  }

  return (
    <div className="animate-fade-in">
      <div className="page-header">
        <h1>🛠 Admin AI Tools</h1>
        <p>Manage the AI fraud detection model — admin access only</p>
      </div>

      {/* 2-column grid */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.25rem', marginBottom: '1.25rem' }}>

        {/* Model Information */}
        {modelLoading
          ? <LoadingSkeleton type="chart" height={260} />
          : <ModelInfoCard modelInfo={modelInfo} />
        }

        {/* Retrain Model */}
        <div className="data-card">
          <h6 style={{ fontWeight: 700, marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <FiRefreshCw size={16} color="var(--primary)" /> Retrain Model
          </h6>

          <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', marginBottom: '1.25rem' }}>
            Trigger model retraining using the latest approved claims dataset. The model will be updated and validated before deployment.
          </p>

          {/* Status indicator */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem', padding: '0.75rem', background: 'var(--border-light)', borderRadius: 'var(--radius-md)', fontSize: '0.82rem' }}>
            <span style={{ width: 10, height: 10, borderRadius: '50%', background: retraining ? '#FF9800' : '#4CAF50', flexShrink: 0, animation: retraining ? 'pulse 1s infinite' : 'none' }} />
            <span style={{ fontWeight: 600 }}>
              {retraining ? 'Training in progress…' : retrainDone ? 'Training complete' : 'Model ready'}
            </span>
          </div>

          {retrainDone && (
            <Alert type="success" message="Model retraining initiated. Check logs for progress." />
          )}
          {retrainError && <Alert type="error" message={retrainError} />}

          <button
            className={`btn-hg btn-lg-hg ${retraining ? 'btn-secondary-hg' : 'btn-primary-hg'}`}
            onClick={handleRetrain}
            disabled={retraining}
            style={{ width: '100%' }}
          >
            {retraining
              ? <><FiRefreshCw size={16} style={{ animation: 'spin 1s linear infinite' }} /> Training…</>
              : <><FiRefreshCw size={16} /> Retrain Model</>
            }
          </button>
        </div>

        {/* Upload Training Dataset */}
        <div className="data-card">
          <h6 style={{ fontWeight: 700, marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <FiUpload size={16} color="var(--primary)" /> Upload Training Dataset
          </h6>

          <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', marginBottom: '1rem' }}>
            Upload a CSV or JSON dataset file to augment the training corpus.
          </p>

          <DocumentViewer
            files={datasetFiles}
            onChange={setDatasetFiles}
            maxFiles={1}
            accept=".csv,application/json,.json"
          />

          {uploadDone && (
            <Alert type="success" message="Dataset uploaded successfully. Trigger retraining to apply." />
          )}

          <button
            className="btn-hg btn-primary-hg"
            onClick={handleUpload}
            disabled={!datasetFiles.length || uploading}
            style={{ marginTop: '1rem', width: '100%' }}
          >
            {uploading
              ? <><FiUpload size={14} style={{ animation: 'spin 1s linear infinite' }} /> Uploading…</>
              : <><FiUpload size={14} /> Upload Dataset</>
            }
          </button>
        </div>

        {/* System Logs */}
        <div className="data-card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
            <h6 style={{ margin: 0, fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <FiTerminal size={16} color="var(--primary)" /> System Logs
            </h6>
            <button
              className="btn-hg btn-secondary-hg btn-sm-hg"
              onClick={() => {
                const ts = new Date().toISOString().replace('T',' ').slice(0,19)
                setLogs(prev => [...prev, `[${ts}] Manual log refresh requested`])
              }}
            >
              <FiRefreshCw size={12} /> Refresh
            </button>
          </div>
          <div style={{
            background: '#0D1117', borderRadius: 'var(--radius-md)',
            padding: '1rem', maxHeight: 220, overflowY: 'auto',
            fontFamily: 'monospace', fontSize: '0.75rem', color: '#4CAF50',
            lineHeight: 1.7,
          }}>
            {logs.map((line, i) => (
              <div key={i}>{line}</div>
            ))}
            <div ref={logsEndRef} />
          </div>

          <button
            className="btn-hg btn-outline-hg btn-sm-hg"
            onClick={() => alert('Export predictions CSV — connect backend.')}
            style={{ marginTop: '1rem' }}
          >
            <FiDownload size={13} /> Export Prediction Logs
          </button>
        </div>
      </div>
    </div>
  )
}
