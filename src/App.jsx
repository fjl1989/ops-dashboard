import React, { useState, useEffect } from 'react'
import { TrendingUp, TrendingDown, CheckCircle, RefreshCw, ShoppingBag, CreditCard, Globe, Users, Monitor, Truck, Package, AlertCircle } from 'lucide-react'

// Fallback mock data (used while loading or if API fails)
const mockData = {
  consumer: { tiktokGMV: 0, tiktokTarget: 50000, orders: 0, dispatchSLA: 0, responseTime: 0, reviewScore: 0, returnRate: 0 },
  trade: { outstandingDebt: 0, overdueInvoices: 0, avgDaysToPay: 0, orderFulfilment: 0, otifDelivery: 0, returnsRate: 0 },
  international: { actualOrders: 0, forecastedOrders: 1, stockCover: 0, dataAccuracy: 0, forecastVariance: 0, regions: [] },
  management: { nominations: 0, nominationTarget: 12, facilitiesTickets: 0, hsIncidents: 0, nearMisses: 0, daysSinceIncident: 0 },
  website: { adSpend: 0, adBudget: 15000, revenue: 0, roas: 0, odooStatus: 'unknown', lastSync: 0, channels: [] },
  suppliers: { ytdSpend: 0, lySpend: 1, activeSuppliers: 0, onTimeDelivery: 0, qualityPassRate: 0, avgLeadTime: 0, costVariance: 0 },
  stock: { holdingValue: 0, avgMargin: 0, skusInStock: 0, daysOnHand: 0, expiryAlert: 0, belowReorder: 0, slowMoving: 0 }
}

const StatusBadge = ({ value, thresholds, format = 'percent', inverse = false }) => {
  let status = 'success'
  if (inverse) {
    if (value > thresholds.warning) status = 'warning'
    if (value > thresholds.danger) status = 'danger'
  } else {
    if (value < thresholds.warning) status = 'warning'
    if (value < thresholds.danger) status = 'danger'
  }
  
  const colors = {
    success: { bg: '#d1fae5', text: '#047857' },
    warning: { bg: '#fef3c7', text: '#b45309' },
    danger: { bg: '#fee2e2', text: '#b91c1c' },
  }
  
  const formatted = format === 'percent' ? `${value}%` : format === 'days' ? `${value} days` : value
  
  return (
    <span style={{
      padding: '3px 8px',
      borderRadius: '6px',
      fontSize: '11px',
      fontWeight: 500,
      backgroundColor: colors[status].bg,
      color: colors[status].text,
    }}>
      {formatted}
    </span>
  )
}

const MetricCard = ({ label, value, subtext, trend, format = 'number' }) => {
  const formatted = format === 'currency' ? `£${value.toLocaleString()}` 
    : format === 'percent' ? `${value}%`
    : format === 'multiple' ? `${value}x`
    : value.toLocaleString()
    
  return (
    <div style={{ background: '#f8fafc', borderRadius: '8px', padding: '12px' }}>
      <div style={{ fontSize: '10px', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '4px' }}>{label}</div>
      <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px' }}>
        <span style={{ fontSize: '20px', fontWeight: 600, color: '#0f172a' }}>{formatted}</span>
        {trend !== undefined && (
          <span style={{ display: 'flex', alignItems: 'center', fontSize: '11px', color: trend >= 0 ? '#059669' : '#dc2626' }}>
            {trend >= 0 ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
            <span style={{ marginLeft: '2px' }}>{Math.abs(trend)}%</span>
          </span>
        )}
      </div>
      {subtext && <div style={{ fontSize: '10px', color: '#94a3b8', marginTop: '2px' }}>{subtext}</div>}
    </div>
  )
}

const ProgressBar = ({ value, max, color = '#f59e0b' }) => {
  const percent = Math.min((value / max) * 100, 100)
  return (
    <div style={{ height: '6px', background: '#e2e8f0', borderRadius: '3px', overflow: 'hidden' }}>
      <div style={{ height: '100%', background: color, borderRadius: '3px', transition: 'all 0.5s', width: `${percent}%` }} />
    </div>
  )
}

const Section = ({ title, icon: Icon, color, children, fullWidth }) => {
  const colorMap = {
    purple: { bg: '#ede9fe', text: '#7c3aed' },
    teal: { bg: '#ccfbf1', text: '#0d9488' },
    blue: { bg: '#dbeafe', text: '#2563eb' },
    amber: { bg: '#fef3c7', text: '#d97706' },
    pink: { bg: '#fce7f3', text: '#db2777' },
    orange: { bg: '#ffedd5', text: '#ea580c' },
    green: { bg: '#dcfce7', text: '#16a34a' },
  }
  
  return (
    <div style={{
      background: 'white',
      borderRadius: '12px',
      border: '1px solid #e2e8f0',
      padding: '16px',
      gridColumn: fullWidth ? '1 / -1' : undefined,
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '14px', paddingBottom: '12px', borderBottom: '1px solid #f1f5f9' }}>
        <div style={{
          width: '32px',
          height: '32px',
          borderRadius: '8px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: colorMap[color].bg,
          color: colorMap[color].text,
        }}>
          <Icon size={16} />
        </div>
        <h3 style={{ fontSize: '14px', fontWeight: 600, color: '#1e293b', margin: 0 }}>{title}</h3>
      </div>
      {children}
    </div>
  )
}

const AlertItem = ({ count, label, severity }) => {
  const colors = { danger: '#ef4444', warning: '#f59e0b', info: '#3b82f6' }
  return (
    <div style={{ display: 'flex', alignItems: 'flex-start', gap: '8px', background: '#f8fafc', borderRadius: '8px', padding: '10px' }}>
      <div style={{ width: '8px', height: '8px', borderRadius: '50%', marginTop: '5px', flexShrink: 0, background: colors[severity] }} />
      <div style={{ fontSize: '12px', color: '#64748b', lineHeight: 1.4 }}>
        <strong style={{ color: '#1e293b' }}>{count} SKUs</strong> {label}
      </div>
    </div>
  )
}

export default function App() {
  const [data, setData] = useState(mockData)
  const [lastUpdated, setLastUpdated] = useState(new Date())
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState(null)

  const fetchData = async () => {
    setIsRefreshing(true)
    setError(null)
    
    try {
      const response = await fetch('/api/dashboard')
      if (!response.ok) throw new Error('Failed to fetch data')
      const newData = await response.json()
      setData(newData)
      setLastUpdated(new Date())
    } catch (err) {
      console.error('Error fetching data:', err)
      setError(err.message)
    } finally {
      setIsRefreshing(false)
      setIsLoading(false)
    }
  }

  // Fetch data on load and every 5 minutes
  useEffect(() => {
    fetchData()
    const interval = setInterval(fetchData, 5 * 60 * 1000)
    return () => clearInterval(interval)
  }, [])

  const variance = data.international.forecastedOrders > 0 
    ? ((data.international.actualOrders - data.international.forecastedOrders) / data.international.forecastedOrders * 100).toFixed(1)
    : 0

  if (isLoading) {
    return (
      <div style={{ minHeight: '100vh', background: '#f1f5f9', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif' }}>
        <div style={{ textAlign: 'center' }}>
          <RefreshCw size={32} style={{ animation: 'spin 1s linear infinite', color: '#64748b' }} />
          <p style={{ marginTop: '12px', color: '#64748b' }}>Loading dashboard...</p>
        </div>
      </div>
    )
  }

  return (
    <div style={{ minHeight: '100vh', background: '#f1f5f9', padding: '20px', fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif' }}>
      <div style={{ maxWidth: '1400px', margin: '0 auto' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
          <div>
            <h1 style={{ fontSize: '26px', fontWeight: 700, color: '#0f172a', margin: 0 }}>Ops Dashboard</h1>
            <p style={{ fontSize: '13px', color: '#64748b', margin: '4px 0 0' }}>
              Last updated: {lastUpdated.toLocaleTimeString()}
              {error && <span style={{ color: '#dc2626', marginLeft: '8px' }}>⚠ {error}</span>}
            </p>
          </div>
          <button
            onClick={fetchData}
            disabled={isRefreshing}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              padding: '10px 16px',
              background: 'white',
              border: '1px solid #e2e8f0',
              borderRadius: '8px',
              fontSize: '14px',
              fontWeight: 500,
              color: '#475569',
              cursor: 'pointer',
            }}
          >
            <RefreshCw size={16} style={{ animation: isRefreshing ? 'spin 1s linear infinite' : 'none' }} />
            Refresh
          </button>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px' }}>
          
          <Section title="Consumer insights" icon={ShoppingBag} color="purple">
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginBottom: '12px' }}>
              <MetricCard 
                label="TikTok Shop GMV" 
                value={data.consumer.tiktokGMV} 
                format="currency"
                subtext={`${((data.consumer.tiktokGMV / data.consumer.tiktokTarget) * 100).toFixed(0)}% of target`}
              />
              <MetricCard label="Orders MTD" value={data.consumer.orders} />
            </div>
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 0', borderBottom: '1px solid #f1f5f9' }}>
                <span style={{ fontSize: '13px', color: '#475569' }}>Dispatch SLA</span>
                <StatusBadge value={data.consumer.dispatchSLA} thresholds={{ warning: 95, danger: 90 }} />
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 0', borderBottom: '1px solid #f1f5f9' }}>
                <span style={{ fontSize: '13px', color: '#475569' }}>Response time</span>
                <StatusBadge value={data.consumer.responseTime} thresholds={{ warning: 4, danger: 6 }} inverse format="hrs" />
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 0' }}>
                <span style={{ fontSize: '13px', color: '#475569' }}>Review score</span>
                <span style={{ padding: '3px 8px', borderRadius: '6px', fontSize: '11px', fontWeight: 500, background: '#dbeafe', color: '#1d4ed8' }}>{data.consumer.reviewScore}/5</span>
              </div>
            </div>
          </Section>

          <Section title="Trade insights" icon={CreditCard} color="teal">
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginBottom: '12px' }}>
              <MetricCard 
                label="Outstanding debt" 
                value={data.trade.outstandingDebt} 
                format="currency"
                subtext={`${data.trade.overdueInvoices} invoices overdue`}
              />
              <MetricCard 
                label="Avg days to pay" 
                value={data.trade.avgDaysToPay}
                subtext="Target: 30 days"
              />
            </div>
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 0', borderBottom: '1px solid #f1f5f9' }}>
                <span style={{ fontSize: '13px', color: '#475569' }}>Order fulfilment</span>
                <StatusBadge value={data.trade.orderFulfilment} thresholds={{ warning: 97, danger: 95 }} />
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 0', borderBottom: '1px solid #f1f5f9' }}>
                <span style={{ fontSize: '13px', color: '#475569' }}>OTIF delivery</span>
                <StatusBadge value={data.trade.otifDelivery} thresholds={{ warning: 93, danger: 90 }} />
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 0' }}>
                <span style={{ fontSize: '13px', color: '#475569' }}>Returns rate</span>
                <StatusBadge value={data.trade.returnsRate} thresholds={{ warning: 3, danger: 5 }} inverse />
              </div>
            </div>
          </Section>

          <Section title="International" icon={Globe} color="blue">
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginBottom: '12px' }}>
              <div style={{ background: '#f8fafc', borderRadius: '8px', padding: '12px' }}>
                <div style={{ fontSize: '10px', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '4px' }}>Orders vs forecast</div>
                <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px' }}>
                  <span style={{ fontSize: '20px', fontWeight: 600, color: '#0f172a' }}>{variance > 0 ? '+' : ''}{variance}%</span>
                  {variance >= 0 ? <TrendingUp size={14} color="#059669" /> : <TrendingDown size={14} color="#dc2626" />}
                </div>
                <div style={{ display: 'flex', gap: '3px', height: '24px', alignItems: 'flex-end', marginTop: '8px' }}>
                  {[60, 80, 45, 90, 70, 85].map((h, i) => (
                    <div key={i} style={{ flex: 1, background: '#60a5fa', borderRadius: '2px 2px 0 0', height: `${h * 0.35}px` }} />
                  ))}
                </div>
              </div>
              <MetricCard 
                label="Stock cover" 
                value={data.international.stockCover}
                subtext="Target: 8 weeks"
                format="number"
              />
            </div>
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 0', borderBottom: '1px solid #f1f5f9' }}>
                <span style={{ fontSize: '13px', color: '#475569' }}>Data accuracy</span>
                <StatusBadge value={data.international.dataAccuracy} thresholds={{ warning: 95, danger: 90 }} />
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 0' }}>
                <span style={{ fontSize: '13px', color: '#475569' }}>Forecast variance</span>
                <StatusBadge value={data.international.forecastVariance} thresholds={{ warning: 10, danger: 15 }} inverse format="percent" />
              </div>
            </div>
          </Section>

          <Section title="Management" icon={Users} color="amber">
            <div style={{ marginBottom: '14px' }}>
              <div style={{ fontSize: '10px', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '8px' }}>Recognition scheme</div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', marginBottom: '4px' }}>
                <span style={{ color: '#64748b' }}>Nominations this month</span>
                <span style={{ fontWeight: 600 }}>{data.management.nominations}/{data.management.nominationTarget}</span>
              </div>
              <ProgressBar value={data.management.nominations} max={data.management.nominationTarget} />
            </div>
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 0', borderBottom: '1px solid #f1f5f9' }}>
                <span style={{ fontSize: '13px', color: '#475569' }}>Facilities tickets open</span>
                <span style={{ padding: '3px 8px', borderRadius: '6px', fontSize: '11px', fontWeight: 500, background: '#fef3c7', color: '#b45309' }}>{data.management.facilitiesTickets}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 0', borderBottom: '1px solid #f1f5f9' }}>
                <span style={{ fontSize: '13px', color: '#475569' }}>H&S incidents (MTD)</span>
                <span style={{ padding: '3px 8px', borderRadius: '6px', fontSize: '11px', fontWeight: 500, background: '#d1fae5', color: '#047857' }}>{data.management.hsIncidents}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 0' }}>
                <span style={{ fontSize: '13px', color: '#475569' }}>Near misses reported</span>
                <span style={{ padding: '3px 8px', borderRadius: '6px', fontSize: '11px', fontWeight: 500, background: '#dbeafe', color: '#1d4ed8' }}>{data.management.nearMisses}</span>
              </div>
            </div>
          </Section>

          <Section title="Website" icon={Monitor} color="pink">
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginBottom: '12px' }}>
              <MetricCard 
                label="Ad spend (MTD)" 
                value={data.website.adSpend} 
                format="currency"
                subtext={`Budget: £${data.website.adBudget.toLocaleString()}`}
              />
              <MetricCard 
                label="ROAS" 
                value={data.website.roas} 
                format="multiple"
                subtext="Target: 4x"
              />
            </div>
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 0', borderBottom: '1px solid #f1f5f9' }}>
                <span style={{ fontSize: '13px', color: '#475569' }}>Odoo sync status</span>
                <span style={{ padding: '3px 8px', borderRadius: '6px', fontSize: '11px', fontWeight: 500, background: '#d1fae5', color: '#047857', display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <CheckCircle size={10} /> {data.website.odooStatus}
                </span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 0' }}>
                <span style={{ fontSize: '13px', color: '#475569' }}>Last sync</span>
                <span style={{ padding: '3px 8px', borderRadius: '6px', fontSize: '11px', fontWeight: 500, background: '#dbeafe', color: '#1d4ed8' }}>{data.website.lastSync} mins ago</span>
              </div>
            </div>
          </Section>

          <Section title="Suppliers" icon={Truck} color="orange">
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginBottom: '12px' }}>
              <MetricCard 
                label="YTD spend" 
                value={data.suppliers.ytdSpend} 
                format="currency"
                trend={data.suppliers.lySpend > 0 ? parseFloat(((data.suppliers.ytdSpend - data.suppliers.lySpend) / data.suppliers.lySpend * 100).toFixed(1)) : 0}
              />
              <MetricCard 
                label="Avg lead time" 
                value={data.suppliers.avgLeadTime}
                subtext={`${data.suppliers.activeSuppliers} suppliers`}
              />
            </div>
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 0', borderBottom: '1px solid #f1f5f9' }}>
                <span style={{ fontSize: '13px', color: '#475569' }}>On-time delivery</span>
                <StatusBadge value={data.suppliers.onTimeDelivery} thresholds={{ warning: 93, danger: 90 }} />
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 0', borderBottom: '1px solid #f1f5f9' }}>
                <span style={{ fontSize: '13px', color: '#475569' }}>Quality pass rate</span>
                <StatusBadge value={data.suppliers.qualityPassRate} thresholds={{ warning: 97, danger: 95 }} />
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 0' }}>
                <span style={{ fontSize: '13px', color: '#475569' }}>Cost variance</span>
                <span style={{ padding: '3px 8px', borderRadius: '6px', fontSize: '11px', fontWeight: 500, background: '#fee2e2', color: '#b91c1c' }}>+{data.suppliers.costVariance}%</span>
              </div>
            </div>
          </Section>

          <Section title="Stock" icon={Package} color="green" fullWidth>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '10px', marginBottom: '16px' }}>
              <MetricCard label="Holding value" value={data.stock.holdingValue} format="currency" />
              <MetricCard label="Avg margin" value={data.stock.avgMargin} format="percent" />
              <MetricCard label="SKUs in stock" value={data.stock.skusInStock} />
              <MetricCard label="Days on hand" value={data.stock.daysOnHand} subtext="Target: 45 days" />
            </div>
            <div style={{ fontSize: '10px', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '10px' }}>Potential issues</div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '10px' }}>
              <AlertItem count={data.stock.expiryAlert} label="approaching expiry (next 30 days)" severity="danger" />
              <AlertItem count={data.stock.belowReorder} label="below reorder point" severity="warning" />
              <AlertItem count={data.stock.slowMoving} label="with slow-moving flag (>90 days)" severity="info" />
            </div>
          </Section>

        </div>
      </div>
      
      <style>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        @media (max-width: 1000px) {
          div[style*="grid-template-columns: repeat(3"] {
            grid-template-columns: repeat(2, 1fr) !important;
          }
        }
        @media (max-width: 700px) {
          div[style*="grid-template-columns: repeat(3"], div[style*="grid-template-columns: repeat(4"] {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>
    </div>
  )
}
