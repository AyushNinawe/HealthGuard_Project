/**
 * AIAnalytics page — /ai/analytics
 * Comprehensive AI fraud detection analytics dashboard
 */
import { useState, useEffect, useCallback } from 'react'
import {
  Chart as ChartJS, ArcElement, BarElement, CategoryScale,
  LinearScale, Tooltip, Legend, Title,
} from 'chart.js'
import { Doughnut, Bar, Pie } from 'react-chartjs-2'
import {
  FiActivity, FiRefreshCw, FiAlertTriangle,
  FiCheckCircle, FiTarget, FiTrendingUp,
} from 'react-icons/fi'
import aiService       from '../../services/aiService'
import AnalyticsCard   from '../../components/ai/AnalyticsCard'
import ModelInfoCard   from '../../components/ai/ModelInfoCard'
import LoadingSkeleton from '../../components/ai/LoadingSkeleton'
import Alert           from '../../components/common/Alert'
import { MOCK_ANALYTICS, MOCK_MODEL_INFO } from '../../utils/aiMockData'

ChartJS.register(ArcElement, BarElement, CategoryScale, LinearScale, Tooltip, Legend, Title)

const SUMMARY_CARDS = [
  { key: 'totalAnalysed',  label: 'Total Analyzed',  icon: FiActivity,      color: '#1565C0', bg: '#E3F2FD', format: 'number' },
  { key: 'fraudDetected',  label: 'Fraud Detected',  icon: FiAlertTriangle, color: '#C62828', bg: '#FFEBEE', format: 'number' },
  { key: 'genuineClaims',  label: 'Genuine Claims',  icon: FiCheckCircle,   color: '#2E7D32', bg: '#E8F5E9', format: 'number' },
  { key: 'accuracyRate',   label: 'Accuracy Rate',   icon: FiTarget,        color: '#E65100', bg: '#FFF3E0', format: 'percent' },
]

const CHART_OPT = {
  responsive: true, maintainAspectRatio: false,
  plugins: { legend: { display: false } },
  scales: {
    x: { grid: { display: false } },
    y: { grid: { color: '#F3F4F6' } },
  },
}

const H_OPT = {
  indexAxis: 'y', responsive: true, maintainAspectRatio: false,
  plugins: { legend: { display: false } },
  scales: {
    x: { grid: { color: '#F3F4F6' } },
    y: { grid: { display: false } },
  },
}

export default function AIAnalytics() {
  const [analytics,  setAnalytics]  = useState(null)
  const [modelInfo,  setModelInfo]  = useState(null)
  const [loading,    setLoading]    = useState(true)
  const [isDemo,     setIsDemo]     = useState(false)

  const load = useCallback(() => {
    setLoading(true)
    setIsDemo(false)
    Promise.all([aiService.getAnalytics(), aiService.getModelInfo()])
      .then(([a, m]) => { setAnalytics(a); setModelInfo(m) })
      .catch(() => { setAnalytics(MOCK_ANALYTICS); setModelInfo(MOCK_MODEL_INFO); setIsDemo(true) })
      .finally(() => setLoading(false))
  }, [])

  useEffect(() => { load() }, [load])

  if (loading) return (
    <div className="animate-fade-in">
      <div className="page-header">
        <h1>📊 AI Analytics</h1>
        <p>Loading analytics data…</p>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1rem', marginBottom: '1.5rem' }}>
        {[1,2,3,4].map(i => <LoadingSkeleton key={i} type="card" rows={1} />)}
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '1.25rem', marginBottom: '1.25rem' }}>
        <LoadingSkeleton type="chart" height={240} />
        <LoadingSkeleton type="chart" height={240} />
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.25rem' }}>
        <LoadingSkeleton type="chart" height={220} />
        <LoadingSkeleton type="chart" height={220} />
      </div>
    </div>
  )

  const a = {
    ...MOCK_ANALYTICS,
    ...(analytics || {}),
    summary: { ...MOCK_ANALYTICS.summary, ...(analytics?.summary || {}) },
    fraudVsGenuine: { ...MOCK_ANALYTICS.fraudVsGenuine, ...(analytics?.fraudVsGenuine || {}) },
    monthlyTrend: (analytics?.monthlyTrend?.length ? analytics.monthlyTrend : MOCK_ANALYTICS.monthlyTrend),
    riskDistribution: (analytics?.riskDistribution?.length ? analytics.riskDistribution : MOCK_ANALYTICS.riskDistribution),
    claimAmountDist: (analytics?.claimAmountDist?.length ? analytics.claimAmountDist : MOCK_ANALYTICS.claimAmountDist),
    topHospitals: (analytics?.topHospitals?.length ? analytics.topHospitals : MOCK_ANALYTICS.topHospitals),
    topRegions: (analytics?.topRegions?.length ? analytics.topRegions : MOCK_ANALYTICS.topRegions),
    fraudByType: (analytics?.fraudByType?.length ? analytics.fraudByType : MOCK_ANALYTICS.fraudByType),
  }

  // Chart datasets
  const doughnutData = {
    labels: ['Fraud', 'Genuine'],
    datasets: [{ data: [a.fraudVsGenuine?.fraud ?? 0, a.fraudVsGenuine?.genuine ?? 0], backgroundColor: ['#EF5350','#42A5F5'], borderColor: ['#fff','#fff'], borderWidth: 3 }],
  }
  const stackedBarData = {
    labels: a.monthlyTrend.map(m => m.month),
    datasets: [
      { label: 'Fraud',   data: a.monthlyTrend.map(m => m.fraud),   backgroundColor: '#EF5350', stack: 'c', borderRadius: { topLeft:4, topRight:4 } },
      { label: 'Genuine', data: a.monthlyTrend.map(m => m.genuine), backgroundColor: '#42A5F5', stack: 'c' },
    ],
  }
  const stackedOpt = { responsive: true, maintainAspectRatio: false, plugins: { legend: { position: 'top' } }, scales: { x: { stacked: true, grid: { display: false } }, y: { stacked: true, grid: { color: '#F3F4F6' } } } }

  const riskColors = ['#4CAF50','#FF9800','#BF360C','#B71C1C']
  const riskBarData = {
    labels: a.riskDistribution.map(r => r.level),
    datasets: [{ label: 'Claims', data: a.riskDistribution.map(r => r.count), backgroundColor: riskColors, borderRadius: 6, borderSkipped: false }],
  }
  const amountBarData = {
    labels: a.claimAmountDist.map(d => d.range),
    datasets: [{ label: 'Claims', data: a.claimAmountDist.map(d => d.count), backgroundColor: '#1565C0', borderRadius: 6, borderSkipped: false }],
  }
  const hospitalData = {
    labels: a.topHospitals.map(h => h.hospital),
    datasets: [{ label: 'Fraud Cases', data: a.topHospitals.map(h => h.fraudCount), backgroundColor: 'rgba(198,40,40,0.75)', borderRadius: 4 }],
  }
  const regionData = {
    labels: a.topRegions.map(r => r.region),
    datasets: [{ label: 'Fraud Cases', data: a.topRegions.map(r => r.fraudCount), backgroundColor: 'rgba(230,81,0,0.75)', borderRadius: 4 }],
  }
  const pieData = {
    labels: a.fraudByType.map(f => f.type),
    datasets: [{ data: a.fraudByType.map(f => f.count), backgroundColor: ['#1565C0','#42A5F5','#EF5350','#FF9800'], borderColor: '#fff', borderWidth: 2 }],
  }

  return (
    <div className="animate-fade-in">
      {/* Header */}
      <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '0.5rem' }}>
        <div>
          <h1>📊 AI Analytics</h1>
          <p>Real-time AI fraud detection performance overview</p>
        </div>
        <button className="btn-hg btn-outline-hg" onClick={load} disabled={loading}>
          <FiRefreshCw size={14} /> Refresh
        </button>
      </div>

      {isDemo && (
        <Alert type="warning" message="Showing demo data — connect the backend to see live analytics." onDismiss={() => setIsDemo(false)} />
      )}

      {/* Summary cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1rem', marginBottom: '1.5rem' }}>
        {SUMMARY_CARDS.map(card => (
          <AnalyticsCard
            key={card.key}
            label={card.label}
            icon={card.icon}
            color={card.color}
            bg={card.bg}
            format={card.format}
            value={a.summary[card.key]}
          />
        ))}
      </div>

      {/* Row 1: Doughnut + Stacked Bar */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '1.25rem', marginBottom: '1.25rem' }}>
        <div className="data-card">
          <h6 style={{ fontWeight: 700, marginBottom: '1rem' }}>Fraud vs Genuine</h6>
          <div style={{ height: 240 }}>
            <Doughnut data={doughnutData} options={{ responsive: true, maintainAspectRatio: false, cutout: '65%', plugins: { legend: { position: 'bottom' } } }} />
          </div>
        </div>
        <div className="data-card">
          <h6 style={{ fontWeight: 700, marginBottom: '1rem' }}>Monthly Fraud Trend</h6>
          <div style={{ height: 240 }}>
            <Bar data={stackedBarData} options={stackedOpt} />
          </div>
        </div>
      </div>

      {/* Row 2: Risk Distribution + Claim Amount */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.25rem', marginBottom: '1.25rem' }}>
        <div className="data-card">
          <h6 style={{ fontWeight: 700, marginBottom: '1rem' }}>Risk Distribution</h6>
          <div style={{ height: 220 }}>
            <Bar data={riskBarData} options={{ ...CHART_OPT, plugins: { ...CHART_OPT.plugins } }} />
          </div>
        </div>
        <div className="data-card">
          <h6 style={{ fontWeight: 700, marginBottom: '1rem' }}>Claim Amount Distribution</h6>
          <div style={{ height: 220 }}>
            <Bar data={amountBarData} options={CHART_OPT} />
          </div>
        </div>
      </div>

      {/* Row 3: Top Hospitals + Top Regions */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.25rem', marginBottom: '1.25rem' }}>
        <div className="data-card">
          <h6 style={{ fontWeight: 700, marginBottom: '1rem' }}>Top Suspicious Hospitals</h6>
          <div style={{ height: 220 }}>
            <Bar data={hospitalData} options={H_OPT} />
          </div>
        </div>
        <div className="data-card">
          <h6 style={{ fontWeight: 700, marginBottom: '1rem' }}>Top Suspicious Regions</h6>
          <div style={{ height: 220 }}>
            <Bar data={regionData} options={H_OPT} />
          </div>
        </div>
      </div>

      {/* Row 4: Fraud by Type + Model Info */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.25rem' }}>
        <div className="data-card">
          <h6 style={{ fontWeight: 700, marginBottom: '1rem' }}>Fraud by Claim Type</h6>
          <div style={{ height: 240 }}>
            <Pie data={pieData} options={{ responsive: true, maintainAspectRatio: false, plugins: { legend: { position: 'bottom' } } }} />
          </div>
        </div>
        <ModelInfoCard modelInfo={modelInfo} />
      </div>
    </div>
  )
}
