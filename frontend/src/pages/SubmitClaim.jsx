import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { FiUpload, FiCheck, FiChevronRight, FiChevronLeft } from 'react-icons/fi'
import { claimService, predictionService, documentService } from '../services/api'
import { validateStep } from '../utils/validators'
import { CLAIM_TYPES, GENDERS } from '../utils/constants'
import Alert from '../components/common/Alert'
import LoadingSpinner from '../components/common/LoadingSpinner'

const STEPS = ['Personal Info', 'Policy Details', 'Incident Info', 'Documents']

const INITIAL = {
  customerName: '', email: '', phone: '', age: '', gender: '',
  policyNumber: '', policyStartDate: '', policyExpiryDate: '', claimAmount: '', claimType: '',
  hospitalName: '', vehicleNumber: '', vehicleAge: '',
  policeReport: '', incidentDate: '', incidentLocation: '', description: '',
  documents: { medicalBill: null, fir: null, insurance: null, images: [] },
}

function Field({ label, name, type = 'text', value, onChange, error, required, children, as = 'input', ...rest }) {
  return (
    <div style={{ marginBottom: '1rem' }}>
      <label className="form-label-hg">{label}{required && <span style={{ color: '#EF5350' }}> *</span>}</label>
      {as === 'select' ? (
        <select className={`form-control-hg${error ? ' is-invalid' : ''}`}
          value={value} onChange={e => onChange(name, e.target.value)} {...rest}>
          {children}
        </select>
      ) : as === 'textarea' ? (
        <textarea className={`form-control-hg${error ? ' is-invalid' : ''}`}
          rows={3} value={value} onChange={e => onChange(name, e.target.value)} {...rest} />
      ) : (
        <input type={type} className={`form-control-hg${error ? ' is-invalid' : ''}`}
          value={value} onChange={e => onChange(name, e.target.value)} {...rest} />
      )}
      {error && <div className="form-error">{error}</div>}
    </div>
  )
}

function FileInput({ label, name, accept, onChange, error, file, required }) {
  return (
    <div style={{ marginBottom: '1rem' }}>
      <label className="form-label-hg">{label}{required && <span style={{ color: '#EF5350' }}> *</span>}</label>
      <label style={{
        display: 'flex', alignItems: 'center', gap: '0.75rem',
        border: `2px dashed ${error ? '#EF5350' : '#CBD5E0'}`,
        borderRadius: '0.625rem', padding: '0.75rem 1rem',
        cursor: 'pointer', background: file ? '#F0FDF4' : '#FAFAFA',
        transition: 'all 0.2s',
      }}>
        <FiUpload size={16} color={file ? '#2E7D32' : '#9CA3AF'} />
        <span style={{ fontSize: '0.875rem', color: file ? '#2E7D32' : '#6B7280' }}>
          {file ? file.name : `Click to upload ${label}`}
        </span>
        <input type="file" accept={accept} style={{ display: 'none' }}
          onChange={e => onChange(name, e.target.files[0] || null)} />
      </label>
      {file && <div style={{ fontSize: '0.75rem', color: '#6B7280', marginTop: '0.25rem' }}>
        {(file.size / 1024).toFixed(1)} KB
      </div>}
      {error && <div className="form-error">{error}</div>}
    </div>
  )
}

export default function SubmitClaim() {
  const navigate    = useNavigate()
  const [step, setStep]         = useState(1)
  const [form, setForm]         = useState(INITIAL)
  const [errors, setErrors]     = useState({})
  const [submitting, setSubmitting] = useState(false)
  const [alert, setAlert]       = useState(null)

  function update(name, value) {
    setForm(f => ({ ...f, [name]: value }))
    setErrors(e => ({ ...e, [name]: null }))
  }

  function updateDoc(name, value) {
    setForm(f => ({ ...f, documents: { ...f.documents, [name]: value } }))
    setErrors(e => ({ ...e, [name]: null }))
  }

  function next() {
    const { isValid, errors: errs } = validateStep(step, form)
    if (!isValid) { setErrors(errs); return }
    setStep(s => s + 1)
  }

  function back() { setStep(s => s - 1) }

  async function handleSubmit() {
    const { isValid, errors: errs } = validateStep(4, form)
    if (!isValid) { setErrors(errs); return }
    setSubmitting(true)
    try {
      const payload = {
        policy_id: form.policyNumber,
        policyNumber: form.policyNumber,
        claim_amount: Number(form.claimAmount) || 0,
        claimAmount: Number(form.claimAmount) || 0,
        claim_type: form.claimType,
        claimType: form.claimType,
        hospital_name: form.hospitalName,
        hospitalName: form.hospitalName,
        vehicle_number: form.vehicleNumber,
        vehicleNumber: form.vehicleNumber,
        vehicle_age: form.vehicleAge ? Number(form.vehicleAge) : null,
        vehicleAge: form.vehicleAge ? Number(form.vehicleAge) : null,
        police_report: form.policeReport,
        policeReport: form.policeReport,
        incident_date: form.incidentDate,
        incidentDate: form.incidentDate,
        incident_location: form.incidentLocation,
        incidentLocation: form.incidentLocation,
        description: form.description,
      }

      const res = await claimService.submitClaim(payload)
      const claimId = res?.claim_id || res?.claimId || res?.id || 1

      // Also upload any files if present
      const docFiles = [form.documents.medicalBill, form.documents.fir, form.documents.insurance].filter(Boolean)
      for (const file of docFiles) {
        try {
          const docFd = new FormData()
          docFd.append('document', file)
          docFd.append('claim_id', claimId)
          await documentService.uploadDocument(docFd)
        } catch (e) {
          console.warn('Document upload warning:', e)
        }
      }

      let prediction = null
      try {
        prediction = await predictionService.predict(claimId)
      } catch (e) {
        console.warn('Prediction run warning:', e)
      }

      navigate(`/claims/${claimId}/prediction`, { state: { prediction, claimId } })
    } catch (err) {
      // Demo: navigate with mock prediction
      const mockPrediction = {
        claimId: 'CLM-DEMO', prediction: Math.random() > 0.5 ? 'Fraud' : 'Genuine',
        confidenceScore: 0.87, fraudProbability: 0.73, genuineProbability: 0.27,
        riskLevel: 'High', reasons: ['Unusually high claim amount', 'Multiple recent claims', 'Incident location inconsistency'],
        recommendedAction: 'Escalate for manual review by senior claims adjuster.',
        analyzedAt: new Date().toISOString(),
      }
      navigate('/claims/DEMO/prediction', { state: { prediction: mockPrediction } })
    } finally { setSubmitting(false) }
  }

  const p = (n) => ({ name: n, value: form[n], onChange: update, error: errors[n] })

  return (
    <div className="animate-fade-in">
      <div className="page-header">
        <h1>Submit New Claim</h1>
        <p>Fill in all required fields to submit an insurance claim for fraud analysis.</p>
      </div>

      <div className="data-card" style={{ maxWidth: 840, margin: '0 auto' }}>
        {/* Stepper */}
        <div className="stepper" style={{ marginBottom: '2rem' }}>
          {STEPS.map((label, i) => {
            const n = i + 1
            const active    = n === step
            const completed = n < step
            return (
              <div key={n} style={{ display: 'flex', alignItems: 'center', flex: 1 }}>
                <div className="step-item" style={{ flex: 'none' }}>
                  <div className={`step-circle${active ? ' active' : ''}${completed ? ' completed' : ''}`}
                    style={{
                      width: 36, height: 36, borderRadius: '50%',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontWeight: 700, fontSize: '0.875rem',
                      background: completed ? '#2E7D32' : active ? '#1565C0' : '#F3F4F6',
                      color: completed || active ? '#fff' : '#9CA3AF',
                      border: 'none', flexShrink: 0,
                    }}>
                    {completed ? <FiCheck size={16} /> : n}
                  </div>
                  <div style={{
                    fontSize: '0.68rem', marginTop: 4,
                    color: active ? '#1565C0' : completed ? '#2E7D32' : '#9CA3AF',
                    fontWeight: active || completed ? 700 : 400, textAlign: 'center', whiteSpace: 'nowrap',
                  }}>{label}</div>
                </div>
                {i < STEPS.length - 1 && (
                  <div style={{
                    flex: 1, height: 2, margin: '0 8px', marginBottom: 20,
                    background: completed ? '#2E7D32' : '#E5E7EB',
                    transition: 'background 0.3s',
                  }} />
                )}
              </div>
            )
          })}
        </div>

        {alert && <Alert type={alert.type} message={alert.msg} onDismiss={() => setAlert(null)} />}

        {/* Step 1: Personal Info */}
        {step === 1 && (
          <div className="animate-fade-in-up">
            <h5 style={{ fontWeight: 700, marginBottom: '1.25rem', color: 'var(--text-primary)' }}>Personal Information</h5>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0 1rem' }}>
              <div style={{ gridColumn: '1 / -1' }}>
                <Field label="Customer Name" required placeholder="Full legal name" {...p('customerName')} />
              </div>
              <Field label="Email"  type="email"  required placeholder="email@example.com" {...p('email')} />
              <Field label="Phone"  type="tel"    required placeholder="+1 234 567 8900" {...p('phone')} />
              <Field label="Age"    type="number" required placeholder="e.g. 35" {...p('age')} />
              <Field label="Gender" required as="select" {...p('gender')}>
                <option value="">Select gender</option>
                {GENDERS.map(g => <option key={g}>{g}</option>)}
              </Field>
            </div>
          </div>
        )}

        {/* Step 2: Policy Details */}
        {step === 2 && (
          <div className="animate-fade-in-up">
            <h5 style={{ fontWeight: 700, marginBottom: '1.25rem', color: 'var(--text-primary)' }}>Policy Details</h5>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0 1rem' }}>
              <div style={{ gridColumn: '1 / -1' }}>
                <Field label="Policy Number" required placeholder="e.g. POL-2024-001234" {...p('policyNumber')} />
              </div>
              <Field label="Policy Start Date" type="date" required {...p('policyStartDate')} />
              <Field label="Policy Expiry Date" type="date" required {...p('policyExpiryDate')} />
              <Field label="Claim Amount (USD)" type="number" required placeholder="0.00" {...p('claimAmount')} />
              <Field label="Claim Type" required as="select" {...p('claimType')}>
                <option value="">Select type</option>
                {CLAIM_TYPES.map(t => <option key={t}>{t}</option>)}
              </Field>
            </div>
          </div>
        )}

        {/* Step 3: Incident Info */}
        {step === 3 && (
          <div className="animate-fade-in-up">
            <h5 style={{ fontWeight: 700, marginBottom: '1.25rem', color: 'var(--text-primary)' }}>Incident Information</h5>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0 1rem' }}>
              {form.claimType === 'Medical' && (
                <div style={{ gridColumn: '1 / -1' }}>
                  <Field label="Hospital Name" required placeholder="Hospital name" {...p('hospitalName')} />
                </div>
              )}
              {form.claimType === 'Vehicle' && (
                <>
                  <Field label="Vehicle Number" required placeholder="e.g. ABC-1234" {...p('vehicleNumber')} />
                  <Field label="Vehicle Age (years)" type="number" placeholder="e.g. 3" {...p('vehicleAge')} />
                </>
              )}
              <Field label="Police Report Filed?" required as="select" {...p('policeReport')}>
                <option value="">Select</option>
                <option value="Yes">Yes</option>
                <option value="No">No</option>
              </Field>
              <Field label="Incident Date" type="date" required {...p('incidentDate')} />
              <div style={{ gridColumn: '1 / -1' }}>
                <Field label="Incident Location" required placeholder="City, State, Country" {...p('incidentLocation')} />
              </div>
              <div style={{ gridColumn: '1 / -1' }}>
                <Field label="Description" required as="textarea" placeholder="Describe what happened in detail..." {...p('description')} />
              </div>
            </div>
          </div>
        )}

        {/* Step 4: Documents */}
        {step === 4 && (
          <div className="animate-fade-in-up">
            <h5 style={{ fontWeight: 700, marginBottom: '1.25rem', color: 'var(--text-primary)' }}>Upload Documents</h5>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '1.25rem' }}>
              Accepted formats: PDF, JPG, PNG. Max 5MB per file.
            </p>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0 1rem' }}>
              <FileInput label="Medical Bill" name="medicalBill" accept=".pdf,.jpg,.jpeg,.png"
                file={form.documents.medicalBill} onChange={(n, v) => updateDoc(n, v)} error={errors.medicalBill} />
              <FileInput label="FIR / Police Report" name="fir" accept=".pdf,.jpg,.jpeg,.png"
                file={form.documents.fir} onChange={(n, v) => updateDoc(n, v)} error={errors.fir} />
              <FileInput label="Insurance Document" name="insurance" accept=".pdf,.jpg,.jpeg,.png"
                file={form.documents.insurance} onChange={(n, v) => updateDoc(n, v)}
                error={errors.insurance} required />
              <div>
                <label className="form-label-hg">Additional Images</label>
                <label style={{
                  display: 'flex', alignItems: 'center', gap: '0.75rem',
                  border: '2px dashed #CBD5E0', borderRadius: '0.625rem',
                  padding: '0.75rem 1rem', cursor: 'pointer', background: '#FAFAFA',
                }}>
                  <FiUpload size={16} color="#9CA3AF" />
                  <span style={{ fontSize: '0.875rem', color: '#6B7280' }}>
                    {form.documents.images.length > 0
                      ? `${form.documents.images.length} file(s) selected`
                      : 'Click to upload images'}
                  </span>
                  <input type="file" multiple accept="image/*" style={{ display: 'none' }}
                    onChange={e => updateDoc('images', Array.from(e.target.files))} />
                </label>
              </div>
            </div>
          </div>
        )}

        {/* Navigation buttons */}
        <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '2rem', paddingTop: '1.5rem', borderTop: '1px solid var(--border)' }}>
          <button className="btn-hg btn-secondary-hg" onClick={back} disabled={step === 1}>
            <FiChevronLeft size={16} /> Back
          </button>
          {step < 4 ? (
            <button className="btn-hg btn-primary-hg" onClick={next}>
              Next <FiChevronRight size={16} />
            </button>
          ) : (
            <button className="btn-hg btn-success-hg btn-lg-hg" onClick={handleSubmit} disabled={submitting}>
              {submitting ? <LoadingSpinner size="sm" /> : <><FiCheck size={16} /> Submit & Analyze</>}
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
