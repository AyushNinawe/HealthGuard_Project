/**
 * FraudGauge — animated SVG semicircle gauge
 * Props: value (0–1 float), size (px)
 */
import { useEffect, useState } from 'react'

export default function FraudGauge({ value = 0, size = 220 }) {
  const [animated, setAnimated] = useState(0)

  // Animate from 0 to value on mount / value change
  useEffect(() => {
    let frame
    let start = null
    const duration = 1400
    const from = 0
    const to = value

    function step(timestamp) {
      if (!start) start = timestamp
      const progress = Math.min((timestamp - start) / duration, 1)
      // ease-out cubic
      const eased = 1 - Math.pow(1 - progress, 3)
      setAnimated(from + (to - from) * eased)
      if (progress < 1) frame = requestAnimationFrame(step)
    }
    frame = requestAnimationFrame(step)
    return () => cancelAnimationFrame(frame)
  }, [value])

  const cx = size / 2
  const cy = size / 2
  const r  = size * 0.38
  // Semicircle: starts at 180° (left), ends at 0° (right), sweeps 180°
  const circumference = Math.PI * r  // half circle arc length
  const pct = Math.round(value * 100)
  const animPct = animated * 100

  // Needle angle: -180° (0%) to 0° (100%), i.e. 180° sweep
  const needleAngle = -180 + animPct * 1.8  // degrees

  // Color thresholds
  const gaugeColor = pct <= 30 ? '#4CAF50' : pct <= 70 ? '#FF9800' : '#F44336'
  const trackColor = '#F3F4F6'

  // Arc path helper: draws a partial arc on top half
  function describeArc(startDeg, endDeg, radius) {
    const toRad = (d) => (d * Math.PI) / 180
    const x1 = cx + radius * Math.cos(toRad(startDeg))
    const y1 = cy + radius * Math.sin(toRad(startDeg))
    const x2 = cx + radius * Math.cos(toRad(endDeg))
    const y2 = cy + radius * Math.sin(toRad(endDeg))
    const largeArc = endDeg - startDeg > 180 ? 1 : 0
    return `M ${x1} ${y1} A ${radius} ${radius} 0 ${largeArc} 1 ${x2} ${y2}`
  }

  // Progress arc: from 180° to (180° + animPct * 1.8°)
  const progressArc = animPct > 0
    ? describeArc(180, 180 + animPct * 1.8, r)
    : null

  // Needle tip coords
  const needleLen = r * 0.82
  const toRad = (d) => (d * Math.PI) / 180
  const nx = cx + needleLen * Math.cos(toRad(needleAngle))
  const ny = cy + needleLen * Math.sin(toRad(needleAngle))

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
      <svg width={size} height={size * 0.62} viewBox={`0 0 ${size} ${size * 0.62}`} overflow="visible">
        {/* Track arc */}
        <path d={describeArc(180, 360, r)} fill="none" stroke={trackColor} strokeWidth={size * 0.065} strokeLinecap="round" />

        {/* Color zones */}
        <path d={describeArc(180, 234, r)} fill="none" stroke="#E8F5E9" strokeWidth={size * 0.065} strokeLinecap="butt" opacity={0.8} />
        <path d={describeArc(234, 288, r)} fill="none" stroke="#FFF8E1" strokeWidth={size * 0.065} strokeLinecap="butt" opacity={0.8} />
        <path d={describeArc(288, 360, r)} fill="none" stroke="#FFEBEE" strokeWidth={size * 0.065} strokeLinecap="butt" opacity={0.8} />

        {/* Progress arc */}
        {progressArc && (
          <path d={progressArc} fill="none" stroke={gaugeColor}
            strokeWidth={size * 0.065} strokeLinecap="round"
            style={{ transition: 'stroke 0.5s' }}
          />
        )}

        {/* Needle */}
        <line x1={cx} y1={cy} x2={nx} y2={ny}
          stroke="#1A1A2E" strokeWidth={2.5} strokeLinecap="round"
          style={{ transition: 'transform 0.05s' }}
        />
        <circle cx={cx} cy={cy} r={size * 0.04} fill="#1A1A2E" />
        <circle cx={cx} cy={cy} r={size * 0.022} fill="#fff" />

        {/* Zone labels */}
        <text x={cx * 0.18} y={cy * 1.18} fontSize={size * 0.058} fill="#4CAF50" fontWeight="700">Low</text>
        <text x={cx * 0.78} y={cy * 1.35} fontSize={size * 0.058} fill="#FF9800" fontWeight="700" textAnchor="middle">Med</text>
        <text x={cx * 1.68} y={cy * 1.18} fontSize={size * 0.058} fill="#F44336" fontWeight="700" textAnchor="end">High</text>
      </svg>

      {/* Center readout */}
      <div style={{ marginTop: '-0.5rem', textAlign: 'center' }}>
        <div style={{ fontSize: size * 0.17, fontWeight: 900, color: gaugeColor, lineHeight: 1, transition: 'color 0.5s' }}>
          {pct}%
        </div>
        <div style={{ fontSize: size * 0.065, color: '#6B7280', marginTop: '0.2rem' }}>Fraud Probability</div>
      </div>
    </div>
  )
}
