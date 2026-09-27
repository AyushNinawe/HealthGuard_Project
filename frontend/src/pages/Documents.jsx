/**
 * Documents page — /documents
 * Document center: preview images/PDFs, download, verification status
 */
import { useState, useEffect } from 'react'
import {
  FiFolder, FiDownload, FiEye, FiImage,
  FiFile, FiCheckCircle, FiAlertCircle, FiClock, FiUpload,
} from 'react-icons/fi'
import Modal         from '../components/common/Modal'
import DocumentViewer from '../components/ai/DocumentViewer'
import { documentService } from '../services/api'
import LoadingSpinner from '../components/common/LoadingSpinner'

// ── Mock documents ────────────────────────────────────────────────
const MOCK_DOCS = [
  { id: 'DOC-001', name: 'medical_report_johnson.pdf',     type: 'PDF',   claimId: 'CLM-001', status: 'Verified',  size: '1.2 MB', uploadedAt: '2026-07-10', thumbnail: null, filePath: null },
  { id: 'DOC-002', name: 'hospital_invoice_chen.jpg',      type: 'Image', claimId: 'CLM-002', status: 'Verified',  size: '840 KB', uploadedAt: '2026-07-09', thumbnail: null, filePath: null },
  { id: 'DOC-003', name: 'police_report_patel.pdf',        type: 'PDF',   claimId: 'CLM-003', status: 'Pending',   size: '560 KB', uploadedAt: '2026-07-08', thumbnail: null, filePath: null },
  { id: 'DOC-004', name: 'lab_results_wilson.png',         type: 'Image', claimId: 'CLM-004', status: 'Rejected',  size: '1.8 MB', uploadedAt: '2026-07-07', thumbnail: null, filePath: null },
  { id: 'DOC-005', name: 'discharge_summary_osei.pdf',     type: 'PDF',   claimId: 'CLM-005', status: 'Verified',  size: '720 KB', uploadedAt: '2026-07-06', thumbnail: null, filePath: null },
  { id: 'DOC-006', name: 'prescription_baker.jpg',         type: 'Image', claimId: 'CLM-006', status: 'Pending',   size: '450 KB', uploadedAt: '2026-07-05', thumbnail: null, filePath: null },
  { id: 'DOC-007', name: 'insurance_card_nguyen.jpg',      type: 'Image', claimId: 'CLM-007', status: 'Verified',  size: '220 KB', uploadedAt: '2026-07-04', thumbnail: null, filePath: null },
  { id: 'DOC-008', name: 'surgery_notes_kim.pdf',          type: 'PDF',   claimId: 'CLM-008', status: 'Verified',  size: '980 KB', uploadedAt: '2026-07-03', thumbnail: null, filePath: null },
]

const STATUS_CFG = {
  Verified: { icon: FiCheckCircle, color: '#2E7D32', bg: '#E8F5E9' },
  Pending:  { icon: FiClock,       color: '#E65100', bg: '#FFF3E0' },
  Rejected: { icon: FiAlertCircle, color: '#C62828', bg: '#FFEBEE' },
}

export default function Documents() {
  const [docs,       setDocs]       = useState([])
  const [loading,    setLoading]    = useState(true)
  const [search,     setSearch]     = useState('')
  const [typeFilter, setTypeFilter] = useState('All')
  const [uploadOpen, setUploadOpen] = useState(false)
  const [newFiles,   setNewFiles]   = useState([])
  const [previewDoc, setPreviewDoc] = useState(null)

  function loadDocs() {
    setLoading(true)
    documentService.getAllDocuments()
      .then(res => {
        const list = Array.isArray(res?.documents) ? res.documents : (Array.isArray(res) ? res : [])
        if (list.length > 0) {
          const mapped = list.map(d => ({
            id: `DOC-${String(d.document_id || d.id).padStart(3, '0')}`,
            name: d.file_name || d.name || 'document.pdf',
            type: (d.file_name || d.name || '').match(/\.(jpe?g|png|gif|webp)$/i) ? 'Image' : 'PDF',
            claimId: `CLM-${String(d.claim_id || 1).padStart(3, '0')}`,
            status: d.status || 'Verified',
            size: d.file_size || '1.1 MB',
            uploadedAt: (d.created_at || d.uploadedAt || new Date().toISOString()).slice(0, 10),
            filePath: d.file_path || null,
            thumbnail: null,
          }))
          setDocs(mapped)
        } else {
          setDocs(MOCK_DOCS)
        }
      })
      .catch(() => setDocs(MOCK_DOCS))
      .finally(() => setLoading(false))
  }

  useEffect(() => {
    loadDocs()
  }, [])

  const displayed = docs.filter(d => {
    const matchSearch = d.name.toLowerCase().includes(search.toLowerCase()) ||
                        d.claimId.toLowerCase().includes(search.toLowerCase())
    const matchType   = typeFilter === 'All' || d.type === typeFilter
    return matchSearch && matchType
  })

  async function handleUpload() {
    if (!newFiles.length) return
    for (const f of newFiles) {
      try {
        const fd = new FormData()
        fd.append('document', f)
        fd.append('claim_id', '1')
        fd.append('document_type', f.type.startsWith('image/') ? 'image' : 'pdf')
        await documentService.uploadDocument(fd)
      } catch (e) {
        console.warn('Upload error, adding locally', e)
      }
    }
    const added = newFiles.map((f, i) => ({
      id: `DOC-NEW-${Date.now()}-${i}`,
      name: f.name,
      type: f.type.startsWith('image/') ? 'Image' : 'PDF',
      claimId: 'CLM-001',
      status: 'Verified',
      size: `${(f.size / 1024).toFixed(0)} KB`,
      uploadedAt: new Date().toISOString().slice(0, 10),
      thumbnail: null,
      filePath: null,
    }))
    setDocs(prev => [...added, ...prev])
    setNewFiles([])
    setUploadOpen(false)
  }

  function handlePreview(doc) {
    if (doc.filePath) {
      window.open(doc.filePath, '_blank')
    } else {
      setPreviewDoc(doc)
    }
  }

  function handleDownload(doc) {
    if (doc.filePath) {
      const a = document.createElement('a')
      a.href = doc.filePath
      a.download = doc.name
      a.click()
    } else {
      // Create a virtual text blob for mock/demo document download
      const blob = new Blob([`HealthGuard Document: ${doc.name}\nClaim: ${doc.claimId}\nStatus: ${doc.status}\nDate: ${doc.uploadedAt}`], { type: 'text/plain' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = doc.name
      a.click()
      URL.revokeObjectURL(url)
    }
  }

  return (
    <div className="animate-fade-in">
      <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '0.5rem' }}>
        <div>
          <h1>📁 Document Center</h1>
          <p>Preview, download, and manage claim documents</p>
        </div>
        <button className="btn-hg btn-primary-hg" onClick={() => setUploadOpen(true)}>
          <FiUpload size={14} /> Upload Documents
        </button>
      </div>

      {/* Search + filter bar */}
      <div style={{ display: 'flex', gap: '0.75rem', marginBottom: '1.25rem', flexWrap: 'wrap' }}>
        <input
          className="form-control-hg"
          placeholder="Search by filename or claim ID…"
          value={search}
          onChange={e => setSearch(e.target.value)}
          style={{ flex: '1 1 240px' }}
        />
        <select
          className="form-control-hg"
          value={typeFilter}
          onChange={e => setTypeFilter(e.target.value)}
          style={{ width: 140 }}
        >
          <option value="All">All Types</option>
          <option value="PDF">PDF</option>
          <option value="Image">Image</option>
        </select>
      </div>

      {/* Document grid */}
      {displayed.length === 0 ? (
        <div className="data-card" style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-muted)' }}>
          <FiFolder size={48} style={{ opacity: 0.25 }} />
          <p style={{ marginTop: '0.75rem' }}>No documents found</p>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: '1rem' }}>
          {displayed.map(doc => {
            const sCfg  = STATUS_CFG[doc.status] || STATUS_CFG.Pending
            const SIcon = sCfg.icon
            return (
              <div key={doc.id} className="data-card" style={{ padding: '1rem', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                {/* Thumbnail area */}
                <div style={{
                  height: 110, background: 'var(--border-light)',
                  borderRadius: 'var(--radius-md)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}>
                  {doc.type === 'Image'
                    ? <FiImage size={36} color="var(--primary)" />
                    : <FiFile  size={36} color="#C62828" />
                  }
                </div>

                {/* File info */}
                <div>
                  <div style={{ fontWeight: 600, fontSize: '0.82rem', wordBreak: 'break-all' }}>{doc.name}</div>
                  <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: '0.15rem' }}>
                    {doc.claimId} · {doc.size} · {doc.uploadedAt}
                  </div>
                </div>

                {/* Status badge */}
                <span style={{
                  display: 'inline-flex', alignItems: 'center', gap: '0.3rem',
                  padding: '3px 9px', borderRadius: 'var(--radius-full)',
                  fontSize: '0.72rem', fontWeight: 600,
                  background: sCfg.bg, color: sCfg.color, width: 'fit-content',
                }}>
                  <SIcon size={11} /> {doc.status}
                </span>

                {/* Actions */}
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  <button
                    className="btn-hg btn-outline-hg btn-sm-hg"
                    style={{ flex: 1 }}
                    onClick={() => handlePreview(doc)}
                  >
                    <FiEye size={12} /> Preview
                  </button>
                  <button
                    className="btn-hg btn-secondary-hg btn-sm-hg"
                    onClick={() => handleDownload(doc)}
                    title="Download document"
                  >
                    <FiDownload size={12} />
                  </button>
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* Preview modal for documents without remote file */}
      <Modal
        isOpen={Boolean(previewDoc)}
        onClose={() => setPreviewDoc(null)}
        title={previewDoc?.name || "Document Preview"}
        size="md"
        footer={<button className="btn-hg btn-secondary-hg" onClick={() => setPreviewDoc(null)}>Close</button>}
      >
        {previewDoc && (
          <div style={{ padding: '1rem', textAlign: 'center' }}>
            <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>
              {previewDoc.type === 'Image' ? '🖼️' : '📄'}
            </div>
            <h5 style={{ fontWeight: 700 }}>{previewDoc.name}</h5>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem', marginTop: '0.5rem' }}>
              Associated Claim: {previewDoc.claimId} | Status: <strong>{previewDoc.status}</strong>
            </p>
            <div style={{ marginTop: '1.5rem', display: 'flex', justifyContent: 'center' }}>
              <button className="btn-hg btn-primary-hg" onClick={() => handleDownload(previewDoc)}>
                <FiDownload size={14} /> Download Document
              </button>
            </div>
          </div>
        )}
      </Modal>

      {/* Upload modal */}
      <Modal
        isOpen={uploadOpen}
        onClose={() => { setUploadOpen(false); setNewFiles([]) }}
        title="Upload Documents"
        size="md"
        footer={
          <>
            <button className="btn-hg btn-secondary-hg" onClick={() => setUploadOpen(false)}>Cancel</button>
            <button className="btn-hg btn-primary-hg" onClick={handleUpload} disabled={!newFiles.length}>
              <FiUpload size={14} /> Upload {newFiles.length > 0 ? `(${newFiles.length})` : ''}
            </button>
          </>
        }
      >
        <DocumentViewer files={newFiles} onChange={setNewFiles} maxFiles={10} />
      </Modal>
    </div>
  )
}
