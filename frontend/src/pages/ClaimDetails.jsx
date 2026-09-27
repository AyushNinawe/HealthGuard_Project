import { useState, useEffect } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import { FiArrowLeft, FiBarChart2, FiFileText, FiUser, FiMapPin, FiCalendar, FiDollarSign } from 'react-icons/fi'
import { claimService } from '../services/api'
import { formatCurrency, formatDate, statusClass, predictionClass, riskLevelClass } from '../utils/formatters'
import LoadingSpinner from '../components/common/LoadingSpinner'
import Alert from '../components/common/Alert'

const MOCK_CLAIM = {
  id: 'CLM-001', userId: 'USR-01',
  customerName: 'Sarah Johnson', email: 'sarah@example.com', phone: '+1 555-0101',
  age: 34, gender: 'Female',
  policyNumber: 'POL-2024-001234', policyStartDate: '2024-01-15', policyExpiryDate: '2025-01-14',
  claimAmount: 12500, claimType: 'Medical', hospitalName: 'City General Hospital',
  policeReport: 'No', incidentDate: '2026-06-20', incidentLocation: 'Chicago, IL',
  description: 'Patient underwent emergency appendectomy following acute abdominal pain. Medical bills include surgery, anesthesia, and 3-day hospital stay.',
  status: 'Approved',
  documents: [
    { id: 'd1', type: 'medical_bill', fileName: 'medical_bill_sarah.pdf', fileSize: 125000, uploadedAt: '2026-06-22' },
    { id: 'd2', type: 'insurance',    fileName: 'insurance_policy.pdf',   fileSize: 89000,  uploadedAt: '2026-06-22' },
  ],
  prediction: {
    prediction: 'Genuine', confidenceScore: 0.94, fraudProbability: 0.06,
    genuineProbability: 0.94, riskLevel: 'Low',
    reasons: ['Claim amount within normal range', 'Hospital billing codes consistent', 'No prior suspicious claims'],
    recommendedAction: 'Approve claim. All documentation is valid and consistent.',
    analyzedAt: '2026-06-22T14:30:00Z',
  },
  createdAt: '2026-06-22', updatedAt: '2026-06-23',
}

function Section({ title, icon: Icon, children }) {
  return (
    <div className="data-card" style={{ marginBottom: '1.25rem' }}>
      <h6 style={{ fontWeight: 700, marginBottom: '1.25rem', color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '0.5rem', borderBottom: '1px solid var(--border)', paddingBottom: '0.75rem' }}>
        <Icon size={16} color="#1565C0" /> {title}
      </h6>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '0.875rem' }}>
        {children}
      </div>
    </div>
  )
}

function Field({ label, value, badge, badgeClass }) {
  return (
    <div>
      <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.25rem' }}>{label}</div>
      {badge
        ? <span className={badgeClass}>{value}</span>
        : <div style={{ fontSize: '0.9rem', fontWeight: 600, color: 'var(--text-primary)' }}>{value || '—'}</div>}
    </div>
  )
}

export default function ClaimDetails() {
  const { id }     = useParams()
  const navigate   = useNavigate()
  const [claim, setClaim]   = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError]   = useState('')

  useEffect(() => {
    claimService.getClaimById(id)
      .then(res => {
        const item = res?.claim || res?.data || res
        setClaim(item || MOCK_CLAIM)
      })
      .catch(() => setClaim(MOCK_CLAIM))
      .finally(() => setLoading(false))
  }, [id])

  if (loading) return <div style={{ display: 'flex', justifyContent: 'center', padding: '3rem' }}><LoadingSpinner size="lg" /></div>
  if (!claim)  return <Alert type="error" message="Claim not found." />

  return (
    <div className="animate-fade-in">
      <div className="page-header" style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
        <button className="btn-hg btn-secondary-hg btn-sm-hg" onClick={() => navigate(-1)}>
          <FiArrowLeft size={14} /> Back
        </button>
        <div style={{ flex: 1 }}>
          <h1>Claim Details</h1>
          <p>Claim ID: {claim.id}</p>
        </div>
        <div style={{ display: 'flex', gap: '0.75rem' }}>
          <span className={statusClass(claim.status)}>{claim.status}</span>
          {claim.prediction && (
            <Link to={`/claims/${claim.id}/prediction`} className="btn-hg btn-primary-hg btn-sm-hg">
              <FiBarChart2 size={13} /> View Prediction
            </Link>
          )}
        </div>
      </div>

      {error && <Alert type="error" message={error} />}

      <Section title="Personal Information" icon={FiUser}>
        <Field label="Customer Name"  value={claim.customerName} />
        <Field label="Email"          value={claim.email} />
        <Field label="Phone"          value={claim.phone} />
        <Field label="Age"            value={claim.age} />
        <Field label="Gender"         value={claim.gender} />
      </Section>

      <Section title="Policy Details" icon={FiDollarSign}>
        <Field label="Policy Number"  value={claim.policyNumber} />
        <Field label="Start Date"     value={formatDate(claim.policyStartDate)} />
        <Field label="Expiry Date"    value={formatDate(claim.policyExpiryDate)} />
        <Field label="Claim Amount"   value={formatCurrency(claim.claimAmount)} />
        <Field label="Claim Type"     value={claim.claimType} />
      </Section>

      <Section title="Incident Information" icon={FiMapPin}>
        <Field label="Incident Date"    value={formatDate(claim.incidentDate)} />
        <Field label="Location"         value={claim.incidentLocation} />
        <Field label="Police Report"    value={claim.policeReport} />
        {claim.hospitalName   && <Field label="Hospital"       value={claim.hospitalName} />}
        {claim.vehicleNumber  && <Field label="Vehicle Number" value={claim.vehicleNumber} />}
        {claim.vehicleAge     && <Field label="Vehicle Age"    value={`${claim.vehicleAge} years`} />}
        <div style={{ gridColumn: '1 / -1' }}>
          <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.35rem' }}>Description</div>
          <p style={{ fontSize: '0.9rem', lineHeight: 1.6, color: 'var(--text-primary)', margin: 0 }}>{claim.description}</p>
        </div>
      </Section>

      {/* Documents */}
      <div className="data-card" style={{ marginBottom: '1.25rem' }}>
        <h6 style={{ fontWeight: 700, marginBottom: '1.25rem', color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '0.5rem', borderBottom: '1px solid var(--border)', paddingBottom: '0.75rem' }}>
          <FiFileText size={16} color="#1565C0" /> Uploaded Documents
        </h6>
        {(!claim.documents || claim.documents.length === 0) ? (
          <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>No documents uploaded.</p>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.625rem' }}>
            {claim.documents.map(doc => (
              <div key={doc.id} style={{
                display: 'flex', alignItems: 'center', gap: '0.875rem',
                padding: '0.75rem 1rem', background: 'var(--primary-bg)',
                borderRadius: '0.625rem', border: '1px solid var(--border)',
              }}>
                <FiFileText size={20} color="#1565C0" />
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 600, fontSize: '0.875rem' }}>{doc.fileName}</div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                    {doc.type.replace('_', ' ')} · {(doc.fileSize / 1024).toFixed(0)} KB · {formatDate(doc.uploadedAt)}
                  </div>
                </div>
                <button className="btn-hg btn-outline-hg btn-sm-hg">Download</button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Prediction summary */}
      {claim.prediction && (
        <div className="data-card" style={{
          background: claim.prediction.prediction === 'Fraud' ? '#FFEBEE' : '#F0FDF4',
          border: `1px solid ${claim.prediction.prediction === 'Fraud' ? '#EF9A9A' : '#A7F3D0'}`,
        }}>
          <h6 style={{ fontWeight: 700, marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <FiBarChart2 size={16} color="#1565C0" /> Prediction Summary
          </h6>
          <div style={{ display: 'flex', gap: '1.5rem', flexWrap: 'wrap', alignItems: 'center' }}>
            <div>
              <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '0.25rem' }}>Result</div>
              <span className={predictionClass(claim.prediction.prediction)}>{claim.prediction.prediction}</span>
            </div>
            <div>
              <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '0.25rem' }}>Confidence</div>
              <span style={{ fontWeight: 700 }}>{Math.round(claim.prediction.confidenceScore * 100)}%</span>
            </div>
            <div>
              <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '0.25rem' }}>Risk Level</div>
              <span className={riskLevelClass(claim.prediction.riskLevel)}>{claim.prediction.riskLevel}</span>
            </div>
            <div style={{ marginLeft: 'auto' }}>
              <Link to={`/claims/${claim.id}/prediction`} className="btn-hg btn-primary-hg btn-sm-hg">
                Full Report →
              </Link>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
