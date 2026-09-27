/**
 * DocumentViewer — file upload drop-zone with preview
 * Props: files (File[]), onChange, maxFiles, accept
 */
import { useRef, useState } from 'react'
import { FiUpload, FiFile, FiX, FiImage } from 'react-icons/fi'

const MAX_FILE_SIZE = 5 * 1024 * 1024 // 5 MB

function matchesAccept(file, accept) {
  if (!accept || accept === '*') return true
  const types = accept.split(',').map(s => s.trim())
  return types.some(t => {
    if (t.endsWith('/*')) return file.type.startsWith(t.replace('/*', '/'))
    if (t.startsWith('.')) return file.name.toLowerCase().endsWith(t.toLowerCase())
    return file.type === t
  })
}

export default function DocumentViewer({
  files = [], onChange, maxFiles = 5,
  accept = 'image/*,application/pdf',
}) {
  const inputRef  = useRef()
  const [hovering, setHovering] = useState(false)
  const [rejected, setRejected] = useState([])

  function addFiles(newFiles) {
    const valid = [], bad = []
    for (const f of newFiles) {
      if (!matchesAccept(f, accept)) { bad.push(`${f.name}: unsupported type`); continue }
      if (f.size > MAX_FILE_SIZE)    { bad.push(`${f.name}: exceeds 5 MB`);      continue }
      valid.push(f)
    }
    setRejected(bad)
    if (!valid.length) return
    const combined = [...files, ...valid].slice(0, maxFiles)
    onChange(combined)
  }

  function removeFile(index) {
    onChange(files.filter((_, i) => i !== index))
  }

  function handleDrop(e) {
    e.preventDefault()
    setHovering(false)
    addFiles(Array.from(e.dataTransfer.files))
  }

  function handleChange(e) {
    addFiles(Array.from(e.target.files))
    e.target.value = ''
  }

  return (
    <div>
      {/* Drop zone */}
      <div
        onClick={() => files.length < maxFiles && inputRef.current?.click()}
        onDragOver={e => { e.preventDefault(); setHovering(true) }}
        onDragLeave={() => setHovering(false)}
        onDrop={handleDrop}
        style={{
          border: `2px dashed ${hovering ? 'var(--primary)' : 'var(--border)'}`,
          borderRadius: 'var(--radius-md)',
          background: hovering ? 'var(--primary-bg)' : 'transparent',
          padding: '1.5rem',
          textAlign: 'center',
          cursor: files.length >= maxFiles ? 'not-allowed' : 'pointer',
          transition: 'all 0.2s',
          opacity: files.length >= maxFiles ? 0.5 : 1,
        }}
      >
        <FiUpload size={28} color="var(--primary)" />
        <p style={{ margin: '0.5rem 0 0.25rem', fontWeight: 600, fontSize: '0.875rem', color: 'var(--text-primary)' }}>
          {files.length >= maxFiles ? `Max ${maxFiles} files reached` : 'Click or drag files here'}
        </p>
        <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', margin: 0 }}>
          PDF or Images, max 5 MB each · up to {maxFiles} files
        </p>
        <input
          ref={inputRef} type="file" multiple
          accept={accept} onChange={handleChange}
          style={{ display: 'none' }}
        />
      </div>

      {/* Rejected files warning */}
      {rejected.length > 0 && (
        <div style={{ marginTop: '0.5rem', fontSize: '0.75rem', color: 'var(--danger)' }}>
          {rejected.map((r, i) => <div key={i}>⚠ {r}</div>)}
        </div>
      )}

      {/* Uploaded file previews */}
      {files.length > 0 && (
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.75rem', marginTop: '1rem' }}>
          {files.map((f, i) => {
            const isImg = f.type.startsWith('image/')
            const url   = isImg ? URL.createObjectURL(f) : null
            return (
              <div key={i} style={{
                position: 'relative', width: 100, height: 100,
                border: '1px solid var(--border)', borderRadius: 'var(--radius-md)',
                overflow: 'hidden', background: 'var(--border-light)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>
                {isImg
                  ? <img src={url} alt={f.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} onLoad={() => URL.revokeObjectURL(url)} />
                  : <div style={{ textAlign: 'center', padding: '0.5rem' }}>
                      <FiFile size={28} color="var(--primary)" />
                      <div style={{ fontSize: '0.6rem', marginTop: '0.25rem', color: 'var(--text-muted)', wordBreak: 'break-all' }}>
                        {f.name.slice(0, 15)}{f.name.length > 15 ? '…' : ''}
                      </div>
                    </div>
                }
                <button onClick={() => removeFile(i)} style={{
                  position: 'absolute', top: 4, right: 4,
                  background: 'rgba(0,0,0,0.55)', border: 'none',
                  borderRadius: '50%', width: 20, height: 20,
                  cursor: 'pointer', color: '#fff',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}>
                  <FiX size={11} />
                </button>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
