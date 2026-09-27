/**
 * ToastContext — global toast notification state
 * Wraps the app in main.jsx to provide addToast / removeToast everywhere
 */
import { createContext, useContext, useState } from 'react'
import ToastNotification from '../components/ai/ToastNotification'

const ToastContext = createContext(null)

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([])

  function addToast(message, type = 'info', duration = 3500) {
    if (!message || typeof message !== 'string' || message.trim() === '') return
    const clamped = Math.min(Math.max(duration, 500), 10000)
    const id = Date.now() + Math.random()
    setToasts(prev => {
      const next = [...prev, { id, message: message.slice(0, 200), type, duration: clamped }]
      return next.length > 5 ? next.slice(next.length - 5) : next
    })
    setTimeout(() => removeToast(id), clamped)
  }

  function removeToast(id) {
    setToasts(prev => prev.filter(t => t.id !== id))
  }

  return (
    <ToastContext.Provider value={{ addToast, removeToast }}>
      {children}
      <ToastNotification toasts={toasts} onDismiss={removeToast} />
    </ToastContext.Provider>
  )
}

export function useToast() {
  const ctx = useContext(ToastContext)
  if (!ctx) throw new Error('useToast must be used inside ToastProvider')
  return ctx
}

export default ToastContext
