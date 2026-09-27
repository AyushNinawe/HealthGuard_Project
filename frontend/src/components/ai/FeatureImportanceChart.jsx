/**
 * FeatureImportanceChart — horizontal bar chart showing AI feature importance
 * Props: features ({ feature, importance }[]), height (px)
 */
import {
  Chart as ChartJS, BarElement, CategoryScale, LinearScale, Tooltip, Legend,
} from 'chart.js'
import { Bar } from 'react-chartjs-2'

ChartJS.register(BarElement, CategoryScale, LinearScale, Tooltip, Legend)

export default function FeatureImportanceChart({ features = [], height = 280 }) {
  const featureList = Array.isArray(features) ? features : []
  if (featureList.length === 0) return (
    <div style={{ height, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)' }}>
      No feature data available
    </div>
  )

  const sorted = [...featureList].sort((a, b) => b.importance - a.importance)

  const data = {
    labels: sorted.map(f => f.feature),
    datasets: [{
      label: 'Importance',
      data: sorted.map(f => f.importance),
      backgroundColor: 'rgba(21,101,192,0.80)',
      borderColor: '#1565C0',
      borderWidth: 1,
      borderRadius: 4,
    }],
  }

  const options = {
    indexAxis: 'y',
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      tooltip: {
        callbacks: {
          label: ctx => ` ${(ctx.raw * 100).toFixed(1)}%`,
        },
      },
    },
    scales: {
      x: {
        grid: { color: '#F3F4F6' },
        max: Math.max(...sorted.map(f => f.importance)) + 0.05,
        ticks: {
          font: { size: 11 },
          callback: v => `${(v * 100).toFixed(0)}%`,
        },
      },
      y: { grid: { display: false }, ticks: { font: { size: 11 } } },
    },
    animation: { duration: 900 },
  }

  return (
    <div style={{ height }}>
      <Bar data={data} options={options} />
    </div>
  )
}
