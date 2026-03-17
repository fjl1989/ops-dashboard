import React, { useState, useEffect } from 'react'
import { TrendingUp, TrendingDown, CheckCircle, RefreshCw, ShoppingBag, CreditCard, Globe, Users, Monitor, Truck, Package, Edit3, Save, X } from 'lucide-react'

// Default data - edit these values or use the Edit button in the dashboard
const defaultData = {
  consumer: {
    tiktokGMV: 47250,
    tiktokTarget: 50000,
    orders: 342,
    dispatchSLA: 96.5,
    responseTime: 3.2,
    reviewScore: 4.7,
    returnRate: 3.8,
  },
  trade: {
    outstandingDebt: 125400,
    overdueInvoices: 12,
    avgDaysToPay: 34,
    orderFulfilment: 98.2,
    otifDelivery: 94.8,
    returnsRate: 2.1,
  },
  international: {
    actualOrders: 892,
    forecastedOrders: 850,
    stockCover: 7.2,
    dataAccuracy: 97.5,
    forecastVariance: 8.2,
  },
  management: {
    nominations: 8,
    nominationTarget: 12,
    facilitiesTickets: 5,
    hsIncidents: 0,
    nearMisses: 2,
    daysSinceIncident: 47,
  },
  website: {
    adSpend: 12450,
    adBudget: 15000,
    revenue: 52800,
    roas: 4.2,
    odooStatus: 'healthy',
    lastSync: 12,
  },
  suppliers: {
    ytdSpend: 892000,
    lySpend: 845000,
    activeSuppliers: 24,
    onTimeDelivery: 93.5,
    qualityPassRate: 98.2,
    avgLeadTime: 12,
    costVariance: 3.2,
  },
  stock: {
    holdingValue: 1245000,
    avgMargin: 42.5,
    skusInStock: 1847,
    daysOnHand: 52,
    expiryAlert: 23,
    belowReorder: 45,
    slowMoving: 89,
  }
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

const EditableValue = ({ value, onChange, isEditing, format = 'number', prefix = '', suffix = '' }) => {
  if (!isEditing) {
    const formatted = format === 'currency' ? `£${Number(value).toLocaleString()}` 
      : format === 'percent' ? `${value}%`
      : format === 'multiple' ? `${value}x`
      : Number(value).toLocaleString()
    return <span style={{ fontSize: '20px', fontWeight: 600, color: '#0f172a' }}>{formatted}</span>
  }
  
  return (
    <input
      type="number"
      value={value}
      onChange={(e) => onChange(parseFloat(e.target.value) || 0)}
      style={{
        width: '100px',
        padding: '4px 8px',
        fontSize: '16px',
        fontWeight: 600,
        border: '2px solid #3b82f6',
        borderRadius: '6px',
        outline: 'none',
      }}
    />
  )
}

const MetricCard = ({ label, value, subtext, trend, format = 'number', isEditing, onChange }) => {
  return (
    <div style={{ background: '#f8fafc', borderRadius: '8px', padding: '12px' }}>
      <div style={{ fontSize: '10px', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '4px' }}>{label}</div>
      <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px' }}>
        <EditableValue value={value} onChange={onChange} isEditing={isEditing} format={format} />
        {trend !== undefined && !isEditing && (
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

const AlertItem = ({ count, label, severity, isEditing, onChange }) => {
  const colors = { danger: '#ef4444', warning: '#f59e0b', info: '#3b82f6' }
  return (
    <div style={{ display: 'flex', alignItems: 'flex-start', gap: '8px', background: '#f8fafc', borderRadius: '8px', padding: '10px' }}>
      <div style={{ width: '8px', height: '8px', borderRadius: '50%', marginTop: '5px', flexShrink: 0, background: colors[severity] }} />
      <div style={{ fontSize: '12px', color: '#64748b', lineHeight: 1.4 }}>
        {isEditing ? (
          <input
            type="number"
            value={count}
            onChange={(e) => onChange(parseInt(e.target.value) || 0)}
            style={{ width: '60px', padding: '2px 6px', fontSize: '12px', fontWeight: 600, border: '2px solid #3b82f6', borderRadius: '4px', marginRight: '4px' }}
          />
        ) : (
          <strong style={{ color: '#1e293b' }}>{count} SKUs</strong>
        )}
        {!isEditing && ' '}{label}
      </div>
    </div>
  )
}

const EditableStatusRow = ({ label, value, isEditing, onChange, thresholds, inverse, format }) => {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 0', borderBottom: '1px solid #f1f5f9' }}>
      <span style={{ fontSize: '13px', color: '#475569' }}>{label}</span>
      {isEditing ? (
        <input
          type="number"
          step="0.1"
          value={value}
          onChange={(e) => onChange(parseFloat(e.target.value) || 0)}
          style={{ width: '70px', padding: '3px 8px', fontSize: '11px', border: '2px solid #3b82f6', borderRadius: '6px', textAlign: 'center' }}
        />
      ) : (
        <StatusBadge value={value} thresholds={thresholds} inverse={inverse} format={format} />
      )}
    </div>
  )
}

export default function App() {
  const [data, setData] = useState(() => {
    const saved = localStorage.getItem('opsDashboardData')
    return saved ? JSON.parse(saved) : defaultData
  })
  const [lastUpdated, setLastUpdated] = useState(() => {
    const saved = localStorage.getItem('opsDashboardLastUpdated')
    return saved ? new Date(saved) : new Date()
  })
  const [isEditing, setIsEditing] = useState(false)

  // Save to localStorage whenever data changes
  useEffect(() => {
    localStorage.setItem('opsDashboardData', JSON.stringify(data))
  }, [data])

  const updateField = (section, field, value) => {
    setData(prev => ({
      ...prev,
      [section]: {
        ...prev[section],
        [field]: value
      }
    }))
  }

  const saveChanges = () => {
    setIsEditing(false)
    setLastUpdated(new Date())
    localStorage.setItem('opsDashboardLastUpdated', new Date().toISOString())
  }

  const cancelChanges = () => {
    const saved = localStorage.getItem('opsDashboardData')
    if (saved) setData(JSON.parse(saved))
    setIsEditing(false)
  }

  const resetToDefaults = () => {
    if (window.confirm('Reset all data to defaults?')) {
      setData(defaultData)
      setLastUpdated(new Date())
      localStorage.setItem('opsDashboardData', JSON.stringify(defaultData))
      localStorage.setItem('opsDashboardLastUpdated', new Date().toISOString())
    }
  }

  const variance = data.international.forecastedOrders > 0 
    ? ((data.international.actualOrders - data.international.forecastedOrders) / data.international.forecastedOrders * 100).toFixed(1)
    : 0

  return (
    <div style={{ minHeight: '100vh', background: '#f1f5f9', padding: '20px', fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif' }}>
      <div style={{ maxWidth: '1400px', margin: '0 auto' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
          <div>
            <h1 style={{ fontSize: '26px', fontWeight: 700, color: '#0f172a', margin: 0 }}>Ops Dashboard</h1>
            <p style={{ fontSize: '13px', color: '#64748b', margin: '4px 0 0' }}>
              Last updated: {lastUpdated.toLocaleString()}
            </p>
          </div>
          <div style={{ display: 'flex', gap: '8px' }}>
            {isEditing ? (
              <>
                <button
                  onClick={saveChanges}
                  style={{
                    display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 16px',
                    background: '#059669', border: 'none', borderRadius: '8px',
                    fontSize: '14px', fontWeight: 500, color: 'white', cursor: 'pointer',
                  }}
                >
                  <Save size={16} /> Save
                </button>
                <button
                  onClick={cancelChanges}
                  style={{
                    display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 16px',
                    background: 'white', border: '1px solid #e2e8f0', borderRadius: '8px',
                    fontSize: '14px', fontWeight: 500, color: '#475569', cursor: 'pointer',
                  }}
                >
                  <X size={16} /> Cancel
                </button>
              </>
            ) : (
              <>
                <button
                  onClick={() => setIsEditing(true)}
                  style={{
                    display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 16px',
                    background: '#3b82f6', border: 'none', borderRadius: '8px',
                    fontSize: '14px', fontWeight: 500, color: 'white', cursor: 'pointer',
                  }}
                >
                  <Edit3 size={16} /> Edit Data
                </button>
                <button
                  onClick={resetToDefaults}
                  style={{
                    display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 16px',
                    background: 'white', border: '1px solid #e2e8f0', borderRadius: '8px',
                    fontSize: '14px', fontWeight: 500, color: '#475569', cursor: 'pointer',
                  }}
                >
                  <RefreshCw size={16} /> Reset
                </button>
              </>
            )}
          </div>
        </div>

        {isEditing && (
          <div style={{ background: '#dbeafe', border: '1px solid #3b82f6', borderRadius: '8px', padding: '12px 16px', marginBottom: '16px', fontSize: '14px', color: '#1e40af' }}>
            ✏️ <strong>Edit Mode:</strong> Click on any value to change it. Press Save when done.
          </div>
        )}

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px' }}>
          
          <Section title="Consumer insights" icon={ShoppingBag} color="purple">
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginBottom: '12px' }}>
              <MetricCard 
                label="TikTok Shop GMV" 
                value={data.consumer.tiktokGMV} 
                format="currency"
                subtext={`${((data.consumer.tiktokGMV / data.consumer.tiktokTarget) * 100).toFixed(0)}% of target`}
                isEditing={isEditing}
                onChange={(v) => updateField('consumer', 'tiktokGMV', v)}
              />
              <MetricCard 
                label="Orders MTD" 
                value={data.consumer.orders}
                isEditing={isEditing}
                onChange={(v) => updateField('consumer', 'orders', v)}
              />
            </div>
            <div>
              <EditableStatusRow label="Dispatch SLA" value={data.consumer.dispatchSLA} isEditing={isEditing} onChange={(v) => updateField('consumer', 'dispatchSLA', v)} thresholds={{ warning: 95, danger: 90 }} />
              <EditableStatusRow label="Response time" value={data.consumer.responseTime} isEditing={isEditing} onChange={(v) => updateField('consumer', 'responseTime', v)} thresholds={{ warning: 4, danger: 6 }} inverse format="hrs" />
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 0' }}>
                <span style={{ fontSize: '13px', color: '#475569' }}>Review score</span>
                {isEditing ? (
                  <input type="number" step="0.1" value={data.consumer.reviewScore} onChange={(e) => updateField('consumer', 'reviewScore', parseFloat(e.target.value) || 0)} style={{ width: '70px', padding: '3px 8px', fontSize: '11px', border: '2px solid #3b82f6', borderRadius: '6px', textAlign: 'center' }} />
                ) : (
                  <span style={{ padding: '3px 8px', borderRadius: '6px', fontSize: '11px', fontWeight: 500, background: '#dbeafe', color: '#1d4ed8' }}>{data.consumer.reviewScore}/5</span>
                )}
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
                isEditing={isEditing}
                onChange={(v) => updateField('trade', 'outstandingDebt', v)}
              />
              <MetricCard 
                label="Avg days to pay" 
                value={data.trade.avgDaysToPay}
                subtext="Target: 30 days"
                isEditing={isEditing}
                onChange={(v) => updateField('trade', 'avgDaysToPay', v)}
              />
            </div>
            <div>
              <EditableStatusRow label="Order fulfilment" value={data.trade.orderFulfilment} isEditing={isEditing} onChange={(v) => updateField('trade', 'orderFulfilment', v)} thresholds={{ warning: 97, danger: 95 }} />
              <EditableStatusRow label="OTIF delivery" value={data.trade.otifDelivery} isEditing={isEditing} onChange={(v) => updateField('trade', 'otifDelivery', v)} thresholds={{ warning: 93, danger: 90 }} />
              <EditableStatusRow label="Returns rate" value={data.trade.returnsRate} isEditing={isEditing} onChange={(v) => updateField('trade', 'returnsRate', v)} thresholds={{ warning: 3, danger: 5 }} inverse />
            </div>
          </Section>

          <Section title="International" icon={Globe} color="blue">
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginBottom: '12px' }}>
              <div style={{ background: '#f8fafc', borderRadius: '8px', padding: '12px' }}>
                <div style={{ fontSize: '10px', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '4px' }}>Orders vs forecast</div>
                {isEditing ? (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                    <div style={{ fontSize: '10px', color: '#64748b' }}>Actual:</div>
                    <input type="number" value={data.international.actualOrders} onChange={(e) => updateField('international', 'actualOrders', parseInt(e.target.value) || 0)} style={{ width: '80px', padding: '4px 8px', fontSize: '14px', border: '2px solid #3b82f6', borderRadius: '6px' }} />
                    <div style={{ fontSize: '10px', color: '#64748b', marginTop: '4px' }}>Forecast:</div>
                    <input type="number" value={data.international.forecastedOrders} onChange={(e) => updateField('international', 'forecastedOrders', parseInt(e.target.value) || 0)} style={{ width: '80px', padding: '4px 8px', fontSize: '14px', border: '2px solid #3b82f6', borderRadius: '6px' }} />
                  </div>
                ) : (
                  <>
                    <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px' }}>
                      <span style={{ fontSize: '20px', fontWeight: 600, color: '#0f172a' }}>{variance > 0 ? '+' : ''}{variance}%</span>
                      {variance >= 0 ? <TrendingUp size={14} color="#059669" /> : <TrendingDown size={14} color="#dc2626" />}
                    </div>
                    <div style={{ display: 'flex', gap: '3px', height: '24px', alignItems: 'flex-end', marginTop: '8px' }}>
                      {[60, 80, 45, 90, 70, 85].map((h, i) => (
                        <div key={i} style={{ flex: 1, background: '#60a5fa', borderRadius: '2px 2px 0 0', height: `${h * 0.35}px` }} />
                      ))}
                    </div>
                  </>
                )}
              </div>
              <MetricCard 
                label="Stock cover" 
                value={data.international.stockCover}
                subtext="Target: 8 weeks"
                format="number"
                isEditing={isEditing}
                onChange={(v) => updateField('international', 'stockCover', v)}
              />
            </div>
            <div>
              <EditableStatusRow label="Data accuracy" value={data.international.dataAccuracy} isEditing={isEditing} onChange={(v) => updateField('international', 'dataAccuracy', v)} thresholds={{ warning: 95, danger: 90 }} />
              <EditableStatusRow label="Forecast variance" value={data.international.forecastVariance} isEditing={isEditing} onChange={(v) => updateField('international', 'forecastVariance', v)} thresholds={{ warning: 10, danger: 15 }} inverse format="percent" />
            </div>
          </Section>

          <Section title="Management" icon={Users} color="amber">
            <div style={{ marginBottom: '14px' }}>
              <div style={{ fontSize: '10px', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '8px' }}>Recognition scheme</div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', marginBottom: '4px' }}>
                <span style={{ color: '#64748b' }}>Nominations this month</span>
                {isEditing ? (
                  <input type="number" value={data.management.nominations} onChange={(e) => updateField('management', 'nominations', parseInt(e.target.value) || 0)} style={{ width: '50px', padding: '2px 6px', fontSize: '12px', border: '2px solid #3b82f6', borderRadius: '4px', textAlign: 'center' }} />
                ) : (
                  <span style={{ fontWeight: 600 }}>{data.management.nominations}/{data.management.nominationTarget}</span>
                )}
              </div>
              <ProgressBar value={data.management.nominations} max={data.management.nominationTarget} />
            </div>
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 0', borderBottom: '1px solid #f1f5f9' }}>
                <span style={{ fontSize: '13px', color: '#475569' }}>Facilities tickets open</span>
                {isEditing ? (
                  <input type="number" value={data.management.facilitiesTickets} onChange={(e) => updateField('management', 'facilitiesTickets', parseInt(e.target.value) || 0)} style={{ width: '50px', padding: '3px 8px', fontSize: '11px', border: '2px solid #3b82f6', borderRadius: '6px', textAlign: 'center' }} />
                ) : (
                  <span style={{ padding: '3px 8px', borderRadius: '6px', fontSize: '11px', fontWeight: 500, background: '#fef3c7', color: '#b45309' }}>{data.management.facilitiesTickets}</span>
                )}
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 0', borderBottom: '1px solid #f1f5f9' }}>
                <span style={{ fontSize: '13px', color: '#475569' }}>H&S incidents (MTD)</span>
                {isEditing ? (
                  <input type="number" value={data.management.hsIncidents} onChange={(e) => updateField('management', 'hsIncidents', parseInt(e.target.value) || 0)} style={{ width: '50px', padding: '3px 8px', fontSize: '11px', border: '2px solid #3b82f6', borderRadius: '6px', textAlign: 'center' }} />
                ) : (
                  <span style={{ padding: '3px 8px', borderRadius: '6px', fontSize: '11px', fontWeight: 500, background: '#d1fae5', color: '#047857' }}>{data.management.hsIncidents}</span>
                )}
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 0' }}>
                <span style={{ fontSize: '13px', color: '#475569' }}>Near misses reported</span>
                {isEditing ? (
                  <input type="number" value={data.management.nearMisses} onChange={(e) => updateField('management', 'nearMisses', parseInt(e.target.value) || 0)} style={{ width: '50px', padding: '3px 8px', fontSize: '11px', border: '2px solid #3b82f6', borderRadius: '6px', textAlign: 'center' }} />
                ) : (
                  <span style={{ padding: '3px 8px', borderRadius: '6px', fontSize: '11px', fontWeight: 500, background: '#dbeafe', color: '#1d4ed8' }}>{data.management.nearMisses}</span>
                )}
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
                isEditing={isEditing}
                onChange={(v) => updateField('website', 'adSpend', v)}
              />
              <MetricCard 
                label="ROAS" 
                value={data.website.roas} 
                format="multiple"
                subtext="Target: 4x"
                isEditing={isEditing}
                onChange={(v) => updateField('website', 'roas', v)}
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
                {isEditing ? (
                  <input type="number" value={data.website.lastSync} onChange={(e) => updateField('website', 'lastSync', parseInt(e.target.value) || 0)} style={{ width: '50px', padding: '3px 8px', fontSize: '11px', border: '2px solid #3b82f6', borderRadius: '6px', textAlign: 'center' }} />
                ) : (
                  <span style={{ padding: '3px 8px', borderRadius: '6px', fontSize: '11px', fontWeight: 500, background: '#dbeafe', color: '#1d4ed8' }}>{data.website.lastSync} mins ago</span>
                )}
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
                isEditing={isEditing}
                onChange={(v) => updateField('suppliers', 'ytdSpend', v)}
              />
              <MetricCard 
                label="Avg lead time" 
                value={data.suppliers.avgLeadTime}
                subtext={`${data.suppliers.activeSuppliers} suppliers`}
                isEditing={isEditing}
                onChange={(v) => updateField('suppliers', 'avgLeadTime', v)}
              />
            </div>
            <div>
              <EditableStatusRow label="On-time delivery" value={data.suppliers.onTimeDelivery} isEditing={isEditing} onChange={(v) => updateField('suppliers', 'onTimeDelivery', v)} thresholds={{ warning: 93, danger: 90 }} />
              <EditableStatusRow label="Quality pass rate" value={data.suppliers.qualityPassRate} isEditing={isEditing} onChange={(v) => updateField('suppliers', 'qualityPassRate', v)} thresholds={{ warning: 97, danger: 95 }} />
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 0' }}>
                <span style={{ fontSize: '13px', color: '#475569' }}>Cost variance</span>
                {isEditing ? (
                  <input type="number" step="0.1" value={data.suppliers.costVariance} onChange={(e) => updateField('suppliers', 'costVariance', parseFloat(e.target.value) || 0)} style={{ width: '70px', padding: '3px 8px', fontSize: '11px', border: '2px solid #3b82f6', borderRadius: '6px', textAlign: 'center' }} />
                ) : (
                  <span style={{ padding: '3px 8px', borderRadius: '6px', fontSize: '11px', fontWeight: 500, background: '#fee2e2', color: '#b91c1c' }}>+{data.suppliers.costVariance}%</span>
                )}
              </div>
            </div>
          </Section>

          <Section title="Stock" icon={Package} color="green" fullWidth>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '10px', marginBottom: '16px' }}>
              <MetricCard label="Holding value" value={data.stock.holdingValue} format="currency" isEditing={isEditing} onChange={(v) => updateField('stock', 'holdingValue', v)} />
              <MetricCard label="Avg margin" value={data.stock.avgMargin} format="percent" isEditing={isEditing} onChange={(v) => updateField('stock', 'avgMargin', v)} />
              <MetricCard label="SKUs in stock" value={data.stock.skusInStock} isEditing={isEditing} onChange={(v) => updateField('stock', 'skusInStock', v)} />
              <MetricCard label="Days on hand" value={data.stock.daysOnHand} subtext="Target: 45 days" isEditing={isEditing} onChange={(v) => updateField('stock', 'daysOnHand', v)} />
            </div>
            <div style={{ fontSize: '10px', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '10px' }}>Potential issues</div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '10px' }}>
              <AlertItem count={data.stock.expiryAlert} label="approaching expiry (next 30 days)" severity="danger" isEditing={isEditing} onChange={(v) => updateField('stock', 'expiryAlert', v)} />
              <AlertItem count={data.stock.belowReorder} label="below reorder point" severity="warning" isEditing={isEditing} onChange={(v) => updateField('stock', 'belowReorder', v)} />
              <AlertItem count={data.stock.slowMoving} label="with slow-moving flag (>90 days)" severity="info" isEditing={isEditing} onChange={(v) => updateField('stock', 'slowMoving', v)} />
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
