import React, { useState, useEffect } from 'react'
import { TrendingUp, TrendingDown, CheckCircle, RefreshCw, ShoppingBag, CreditCard, Globe, Users, Monitor, Truck, Package, Edit3, Save, X, Plus, Trash2 } from 'lucide-react'

// Nutravet brand colors
const brand = {
  primary: '#4A3728',
  secondary: '#6B5344',
  accent: '#8B7355',
  light: '#F5F0EB',
  cream: '#FAF7F4',
}

// Default data
const defaultData = {
  consumer: {
    tiktokGMV: 47250,
    tiktokTarget: 50000,
    orders: 342,
    dispatchSLA: 96.5,
    responseTime: 3.2,
    reviewScore: 4.7,
  },
  trade: {
    outstandingDebt: 125400,
    overdueInvoices: 12,
    avgDaysToPay: 34,
    orderFulfilment: 98.2,
  },
  international: {
    actualOrders: 892,
    forecastedOrders: 850,
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
  },
  suppliers: {
    ytdSpend: 892000,
    lySpend: 845000,
    activeSuppliers: 24,
    onTimeDelivery: 93.5,
    qualityPassRate: 98.2,
    avgLeadTime: 12,
    ordersLastMonth: 156,
  },
  stock: {
    holdingValue: 1245000,
    avgMargin: 42.5,
    skusInStock: 1847,
    expiryAlert: 23,
    belowReorder: 45,
    slowMoving: 89,
    productIssues: [
      { product: 'Nutraquin+', monthsCover: 1.2 },
      { product: 'Nutramarin', monthsCover: 0.8 },
      { product: 'Nutribound', monthsCover: 2.1 },
    ]
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
    <span style={{ padding: '3px 8px', borderRadius: '6px', fontSize: '11px', fontWeight: 500, backgroundColor: colors[status].bg, color: colors[status].text }}>
      {formatted}
    </span>
  )
}

const EditableValue = ({ value, onChange, isEditing, format = 'number' }) => {
  if (!isEditing) {
    const formatted = format === 'currency' ? `£${Number(value).toLocaleString()}` 
      : format === 'percent' ? `${value}%`
      : format === 'multiple' ? `${value}x`
      : Number(value).toLocaleString()
    return <span style={{ fontSize: '20px', fontWeight: 600, color: brand.primary }}>{formatted}</span>
  }
  return (
    <input type="number" value={value} onChange={(e) => onChange(parseFloat(e.target.value) || 0)}
      style={{ width: '100px', padding: '4px 8px', fontSize: '16px', fontWeight: 600, border: `2px solid ${brand.primary}`, borderRadius: '6px', outline: 'none' }} />
  )
}

const MetricCard = ({ label, value, subtext, trend, format = 'number', isEditing, onChange }) => (
  <div style={{ background: brand.light, borderRadius: '8px', padding: '12px' }}>
    <div style={{ fontSize: '10px', color: brand.secondary, textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '4px' }}>{label}</div>
    <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px' }}>
      <EditableValue value={value} onChange={onChange} isEditing={isEditing} format={format} />
      {trend !== undefined && !isEditing && (
        <span style={{ display: 'flex', alignItems: 'center', fontSize: '11px', color: trend >= 0 ? '#059669' : '#dc2626' }}>
          {trend >= 0 ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
          <span style={{ marginLeft: '2px' }}>{Math.abs(trend)}%</span>
        </span>
      )}
    </div>
    {subtext && <div style={{ fontSize: '10px', color: brand.accent, marginTop: '2px' }}>{subtext}</div>}
  </div>
)

const ProgressBar = ({ value, max }) => {
  const percent = Math.min((value / max) * 100, 100)
  return (
    <div style={{ height: '6px', background: '#e2e8f0', borderRadius: '3px', overflow: 'hidden' }}>
      <div style={{ height: '100%', background: brand.primary, borderRadius: '3px', transition: 'all 0.5s', width: `${percent}%` }} />
    </div>
  )
}

const Section = ({ title, icon: Icon, children, fullWidth }) => (
  <div style={{ background: 'white', borderRadius: '12px', border: `1px solid ${brand.light}`, padding: '16px', gridColumn: fullWidth ? '1 / -1' : undefined, boxShadow: '0 1px 3px rgba(74, 55, 40, 0.1)' }}>
    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '14px', paddingBottom: '12px', borderBottom: `1px solid ${brand.light}` }}>
      <div style={{ width: '32px', height: '32px', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: brand.light, color: brand.primary }}>
        <Icon size={16} />
      </div>
      <h3 style={{ fontSize: '14px', fontWeight: 600, color: brand.primary, margin: 0 }}>{title}</h3>
    </div>
    {children}
  </div>
)

const EditableStatusRow = ({ label, value, isEditing, onChange, thresholds, inverse, format, noBorder }) => (
  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 0', borderBottom: noBorder ? 'none' : `1px solid ${brand.light}` }}>
    <span style={{ fontSize: '13px', color: brand.secondary }}>{label}</span>
    {isEditing ? (
      <input type="number" step="0.1" value={value} onChange={(e) => onChange(parseFloat(e.target.value) || 0)}
        style={{ width: '70px', padding: '3px 8px', fontSize: '11px', border: `2px solid ${brand.primary}`, borderRadius: '6px', textAlign: 'center' }} />
    ) : (
      <StatusBadge value={value} thresholds={thresholds} inverse={inverse} format={format} />
    )}
  </div>
)

const ProductIssueRow = ({ product, monthsCover, isEditing, onProductChange, onMonthsChange, onDelete }) => {
  const getMonthsColor = (months) => {
    if (months <= 1) return { bg: '#fee2e2', text: '#b91c1c' }
    if (months <= 2) return { bg: '#fef3c7', text: '#b45309' }
    return { bg: '#dbeafe', text: '#1d4ed8' }
  }
  const colors = getMonthsColor(monthsCover)
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '8px', background: brand.light, borderRadius: '6px', marginBottom: '6px' }}>
      {isEditing ? (
        <>
          <input type="text" value={product} onChange={(e) => onProductChange(e.target.value)} placeholder="Product name"
            style={{ flex: 1, padding: '6px 10px', fontSize: '13px', border: `1px solid ${brand.accent}`, borderRadius: '4px' }} />
          <input type="number" step="0.1" value={monthsCover} onChange={(e) => onMonthsChange(parseFloat(e.target.value) || 0)}
            style={{ width: '70px', padding: '6px 10px', fontSize: '13px', border: `1px solid ${brand.accent}`, borderRadius: '4px', textAlign: 'center' }} />
          <span style={{ fontSize: '11px', color: brand.secondary }}>months</span>
          <button onClick={onDelete} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#b91c1c', padding: '4px' }}><Trash2 size={14} /></button>
        </>
      ) : (
        <>
          <span style={{ flex: 1, fontSize: '13px', color: brand.primary, fontWeight: 500 }}>{product}</span>
          <span style={{ padding: '3px 10px', borderRadius: '6px', fontSize: '11px', fontWeight: 500, background: colors.bg, color: colors.text }}>{monthsCover} months</span>
        </>
      )}
    </div>
  )
}

export default function App() {
  const [data, setData] = useState(() => {
    const saved = localStorage.getItem('nutravetDashboardData')
    return saved ? JSON.parse(saved) : defaultData
  })
  const [lastUpdated, setLastUpdated] = useState(() => {
    const saved = localStorage.getItem('nutravetDashboardLastUpdated')
    return saved ? new Date(saved) : new Date()
  })
  const [isEditing, setIsEditing] = useState(false)

  useEffect(() => { localStorage.setItem('nutravetDashboardData', JSON.stringify(data)) }, [data])

  const updateField = (section, field, value) => {
    setData(prev => ({ ...prev, [section]: { ...prev[section], [field]: value } }))
  }

  const updateProductIssue = (index, field, value) => {
    setData(prev => ({
      ...prev,
      stock: { ...prev.stock, productIssues: prev.stock.productIssues.map((item, i) => i === index ? { ...item, [field]: value } : item) }
    }))
  }

  const addProductIssue = () => {
    if (data.stock.productIssues.length < 10) {
      setData(prev => ({ ...prev, stock: { ...prev.stock, productIssues: [...prev.stock.productIssues, { product: '', monthsCover: 0 }] } }))
    }
  }

  const removeProductIssue = (index) => {
    setData(prev => ({ ...prev, stock: { ...prev.stock, productIssues: prev.stock.productIssues.filter((_, i) => i !== index) } }))
  }

  const saveChanges = () => {
    setIsEditing(false)
    setLastUpdated(new Date())
    localStorage.setItem('nutravetDashboardLastUpdated', new Date().toISOString())
  }

  const cancelChanges = () => {
    const saved = localStorage.getItem('nutravetDashboardData')
    if (saved) setData(JSON.parse(saved))
    setIsEditing(false)
  }

  const resetToDefaults = () => {
    if (window.confirm('Reset all data to defaults?')) {
      setData(defaultData)
      setLastUpdated(new Date())
      localStorage.setItem('nutravetDashboardData', JSON.stringify(defaultData))
      localStorage.setItem('nutravetDashboardLastUpdated', new Date().toISOString())
    }
  }

  const variance = data.international.forecastedOrders > 0 ? ((data.international.actualOrders - data.international.forecastedOrders) / data.international.forecastedOrders * 100).toFixed(1) : 0
  const currentMonth = new Date().toLocaleDateString('en-GB', { month: 'long', year: 'numeric' })

  return (
    <div style={{ minHeight: '100vh', background: brand.cream, padding: '20px', fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif' }}>
      <div style={{ maxWidth: '1400px', margin: '0 auto' }}>
        <div style={{ background: 'white', borderRadius: '12px', padding: '20px 24px', marginBottom: '20px', boxShadow: '0 1px 3px rgba(74, 55, 40, 0.1)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
            <img src="/logo.png" alt="Nutravet" style={{ height: '40px' }} onError={(e) => { e.target.style.display = 'none' }} />
            <div>
              <h1 style={{ fontSize: '24px', fontWeight: 700, color: brand.primary, margin: 0 }}>Monthly Ops Report</h1>
              <p style={{ fontSize: '14px', color: brand.secondary, margin: '4px 0 0' }}>{currentMonth} • Last updated: {lastUpdated.toLocaleString()}</p>
            </div>
          </div>
          <div style={{ display: 'flex', gap: '8px' }}>
            {isEditing ? (
              <>
                <button onClick={saveChanges} style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 16px', background: brand.primary, border: 'none', borderRadius: '8px', fontSize: '14px', fontWeight: 500, color: 'white', cursor: 'pointer' }}><Save size={16} /> Save</button>
                <button onClick={cancelChanges} style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 16px', background: 'white', border: `1px solid ${brand.light}`, borderRadius: '8px', fontSize: '14px', fontWeight: 500, color: brand.secondary, cursor: 'pointer' }}><X size={16} /> Cancel</button>
              </>
            ) : (
              <>
                <button onClick={() => setIsEditing(true)} style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 16px', background: brand.primary, border: 'none', borderRadius: '8px', fontSize: '14px', fontWeight: 500, color: 'white', cursor: 'pointer' }}><Edit3 size={16} /> Edit Data</button>
                <button onClick={resetToDefaults} style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 16px', background: 'white', border: `1px solid ${brand.light}`, borderRadius: '8px', fontSize: '14px', fontWeight: 500, color: brand.secondary, cursor: 'pointer' }}><RefreshCw size={16} /> Reset</button>
              </>
            )}
          </div>
        </div>

        {isEditing && (
          <div style={{ background: brand.light, border: `1px solid ${brand.accent}`, borderRadius: '8px', padding: '12px 16px', marginBottom: '16px', fontSize: '14px', color: brand.primary }}>
            ✏️ <strong>Edit Mode:</strong> Click on any value to change it. Press Save when done.
          </div>
        )}

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px' }}>
          
          <Section title="Consumer insights" icon={ShoppingBag}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginBottom: '12px' }}>
              <MetricCard label="TikTok Shop GMV" value={data.consumer.tiktokGMV} format="currency" subtext={`${((data.consumer.tiktokGMV / data.consumer.tiktokTarget) * 100).toFixed(0)}% of target`} isEditing={isEditing} onChange={(v) => updateField('consumer', 'tiktokGMV', v)} />
              <MetricCard label="Orders MTD" value={data.consumer.orders} isEditing={isEditing} onChange={(v) => updateField('consumer', 'orders', v)} />
            </div>
            <EditableStatusRow label="Dispatch SLA" value={data.consumer.dispatchSLA} isEditing={isEditing} onChange={(v) => updateField('consumer', 'dispatchSLA', v)} thresholds={{ warning: 95, danger: 90 }} />
            <EditableStatusRow label="Response time" value={data.consumer.responseTime} isEditing={isEditing} onChange={(v) => updateField('consumer', 'responseTime', v)} thresholds={{ warning: 4, danger: 6 }} inverse format="hrs" />
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 0' }}>
              <span style={{ fontSize: '13px', color: brand.secondary }}>Review score</span>
              {isEditing ? (
                <input type="number" step="0.1" value={data.consumer.reviewScore} onChange={(e) => updateField('consumer', 'reviewScore', parseFloat(e.target.value) || 0)} style={{ width: '70px', padding: '3px 8px', fontSize: '11px', border: `2px solid ${brand.primary}`, borderRadius: '6px', textAlign: 'center' }} />
              ) : (
                <span style={{ padding: '3px 8px', borderRadius: '6px', fontSize: '11px', fontWeight: 500, background: brand.light, color: brand.primary }}>{data.consumer.reviewScore}/5</span>
              )}
            </div>
          </Section>

          <Section title="Trade insights" icon={CreditCard}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginBottom: '12px' }}>
              <MetricCard label="Outstanding debt" value={data.trade.outstandingDebt} format="currency" subtext={`${data.trade.overdueInvoices} invoices overdue`} isEditing={isEditing} onChange={(v) => updateField('trade', 'outstandingDebt', v)} />
              <MetricCard label="Avg days to pay" value={data.trade.avgDaysToPay} subtext="Target: 30 days" isEditing={isEditing} onChange={(v) => updateField('trade', 'avgDaysToPay', v)} />
            </div>
            <EditableStatusRow label="Order fulfilment" value={data.trade.orderFulfilment} isEditing={isEditing} onChange={(v) => updateField('trade', 'orderFulfilment', v)} thresholds={{ warning: 97, danger: 95 }} noBorder />
          </Section>

          <Section title="International" icon={Globe}>
            <div style={{ background: brand.light, borderRadius: '8px', padding: '12px', marginBottom: '12px' }}>
              <div style={{ fontSize: '10px', color: brand.secondary, textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '4px' }}>Orders vs forecast</div>
              {isEditing ? (
                <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                  <div><div style={{ fontSize: '10px', color: brand.secondary }}>Actual:</div><input type="number" value={data.international.actualOrders} onChange={(e) => updateField('international', 'actualOrders', parseInt(e.target.value) || 0)} style={{ width: '80px', padding: '4px 8px', fontSize: '14px', border: `2px solid ${brand.primary}`, borderRadius: '6px' }} /></div>
                  <div><div style={{ fontSize: '10px', color: brand.secondary }}>Forecast:</div><input type="number" value={data.international.forecastedOrders} onChange={(e) => updateField('international', 'forecastedOrders', parseInt(e.target.value) || 0)} style={{ width: '80px', padding: '4px 8px', fontSize: '14px', border: `2px solid ${brand.primary}`, borderRadius: '6px' }} /></div>
                </div>
              ) : (
                <>
                  <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px' }}>
                    <span style={{ fontSize: '20px', fontWeight: 600, color: brand.primary }}>{variance > 0 ? '+' : ''}{variance}%</span>
                    {variance >= 0 ? <TrendingUp size={14} color="#059669" /> : <TrendingDown size={14} color="#dc2626" />}
                  </div>
                  <div style={{ display: 'flex', gap: '3px', height: '24px', alignItems: 'flex-end', marginTop: '8px' }}>
                    {[60, 80, 45, 90, 70, 85].map((h, i) => (<div key={i} style={{ flex: 1, background: brand.primary, borderRadius: '2px 2px 0 0', height: `${h * 0.35}px`, opacity: 0.7 + (i * 0.05) }} />))}
                  </div>
                </>
              )}
            </div>
            <EditableStatusRow label="Data accuracy" value={data.international.dataAccuracy} isEditing={isEditing} onChange={(v) => updateField('international', 'dataAccuracy', v)} thresholds={{ warning: 95, danger: 90 }} />
            <EditableStatusRow label="Forecast variance" value={data.international.forecastVariance} isEditing={isEditing} onChange={(v) => updateField('international', 'forecastVariance', v)} thresholds={{ warning: 10, danger: 15 }} inverse format="percent" noBorder />
          </Section>

          <Section title="Management" icon={Users}>
            <div style={{ marginBottom: '14px' }}>
              <div style={{ fontSize: '10px', color: brand.secondary, textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '8px' }}>Recognition scheme</div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', marginBottom: '4px' }}>
                <span style={{ color: brand.secondary }}>Nominations this month</span>
                {isEditing ? (<input type="number" value={data.management.nominations} onChange={(e) => updateField('management', 'nominations', parseInt(e.target.value) || 0)} style={{ width: '50px', padding: '2px 6px', fontSize: '12px', border: `2px solid ${brand.primary}`, borderRadius: '4px', textAlign: 'center' }} />) : (<span style={{ fontWeight: 600, color: brand.primary }}>{data.management.nominations}/{data.management.nominationTarget}</span>)}
              </div>
              <ProgressBar value={data.management.nominations} max={data.management.nominationTarget} />
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 0', borderBottom: `1px solid ${brand.light}` }}>
              <span style={{ fontSize: '13px', color: brand.secondary }}>Facilities tickets open</span>
              {isEditing ? (<input type="number" value={data.management.facilitiesTickets} onChange={(e) => updateField('management', 'facilitiesTickets', parseInt(e.target.value) || 0)} style={{ width: '50px', padding: '3px 8px', fontSize: '11px', border: `2px solid ${brand.primary}`, borderRadius: '6px', textAlign: 'center' }} />) : (<span style={{ padding: '3px 8px', borderRadius: '6px', fontSize: '11px', fontWeight: 500, background: '#fef3c7', color: '#b45309' }}>{data.management.facilitiesTickets}</span>)}
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 0', borderBottom: `1px solid ${brand.light}` }}>
              <span style={{ fontSize: '13px', color: brand.secondary }}>H&S incidents (MTD)</span>
              {isEditing ? (<input type="number" value={data.management.hsIncidents} onChange={(e) => updateField('management', 'hsIncidents', parseInt(e.target.value) || 0)} style={{ width: '50px', padding: '3px 8px', fontSize: '11px', border: `2px solid ${brand.primary}`, borderRadius: '6px', textAlign: 'center' }} />) : (<span style={{ padding: '3px 8px', borderRadius: '6px', fontSize: '11px', fontWeight: 500, background: '#d1fae5', color: '#047857' }}>{data.management.hsIncidents}</span>)}
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 0' }}>
              <span style={{ fontSize: '13px', color: brand.secondary }}>Near misses reported</span>
              {isEditing ? (<input type="number" value={data.management.nearMisses} onChange={(e) => updateField('management', 'nearMisses', parseInt(e.target.value) || 0)} style={{ width: '50px', padding: '3px 8px', fontSize: '11px', border: `2px solid ${brand.primary}`, borderRadius: '6px', textAlign: 'center' }} />) : (<span style={{ padding: '3px 8px', borderRadius: '6px', fontSize: '11px', fontWeight: 500, background: brand.light, color: brand.primary }}>{data.management.nearMisses}</span>)}
            </div>
          </Section>

          <Section title="Website" icon={Monitor}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginBottom: '12px' }}>
              <MetricCard label="Ad spend (MTD)" value={data.website.adSpend} format="currency" subtext={`Budget: £${data.website.adBudget.toLocaleString()}`} isEditing={isEditing} onChange={(v) => updateField('website', 'adSpend', v)} />
              <MetricCard label="ROAS" value={data.website.roas} format="multiple" subtext="Target: 4x" isEditing={isEditing} onChange={(v) => updateField('website', 'roas', v)} />
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 0' }}>
              <span style={{ fontSize: '13px', color: brand.secondary }}>Odoo sync status</span>
              <span style={{ padding: '3px 8px', borderRadius: '6px', fontSize: '11px', fontWeight: 500, background: '#d1fae5', color: '#047857', display: 'flex', alignItems: 'center', gap: '4px' }}><CheckCircle size={10} /> {data.website.odooStatus}</span>
            </div>
          </Section>

          <Section title="Suppliers" icon={Truck}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginBottom: '12px' }}>
              <MetricCard label="YTD spend" value={data.suppliers.ytdSpend} format="currency" trend={data.suppliers.lySpend > 0 ? parseFloat(((data.suppliers.ytdSpend - data.suppliers.lySpend) / data.suppliers.lySpend * 100).toFixed(1)) : 0} isEditing={isEditing} onChange={(v) => updateField('suppliers', 'ytdSpend', v)} />
              <MetricCard label="Orders last month" value={data.suppliers.ordersLastMonth} isEditing={isEditing} onChange={(v) => updateField('suppliers', 'ordersLastMonth', v)} />
            </div>
            <EditableStatusRow label="On-time delivery" value={data.suppliers.onTimeDelivery} isEditing={isEditing} onChange={(v) => updateField('suppliers', 'onTimeDelivery', v)} thresholds={{ warning: 93, danger: 90 }} />
            <EditableStatusRow label="Quality pass rate" value={data.suppliers.qualityPassRate} isEditing={isEditing} onChange={(v) => updateField('suppliers', 'qualityPassRate', v)} thresholds={{ warning: 97, danger: 95 }} noBorder />
          </Section>

          <Section title="Stock" icon={Package} fullWidth>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '10px', marginBottom: '16px' }}>
              <MetricCard label="Holding value" value={data.stock.holdingValue} format="currency" isEditing={isEditing} onChange={(v) => updateField('stock', 'holdingValue', v)} />
              <MetricCard label="Avg margin" value={data.stock.avgMargin} format="percent" isEditing={isEditing} onChange={(v) => updateField('stock', 'avgMargin', v)} />
              <MetricCard label="SKUs in stock" value={data.stock.skusInStock} isEditing={isEditing} onChange={(v) => updateField('stock', 'skusInStock', v)} />
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
              <div>
                <div style={{ fontSize: '10px', color: brand.secondary, textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '10px' }}>Stock alerts</div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', background: brand.light, borderRadius: '6px', padding: '10px' }}>
                    <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#ef4444' }} />
                    <div style={{ fontSize: '12px', color: brand.secondary, flex: 1 }}>
                      {isEditing ? (<input type="number" value={data.stock.expiryAlert} onChange={(e) => updateField('stock', 'expiryAlert', parseInt(e.target.value) || 0)} style={{ width: '50px', padding: '2px 6px', fontSize: '12px', border: `2px solid ${brand.primary}`, borderRadius: '4px', marginRight: '4px' }} />) : (<strong style={{ color: brand.primary }}>{data.stock.expiryAlert} SKUs</strong>)} approaching expiry
                    </div>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', background: brand.light, borderRadius: '6px', padding: '10px' }}>
                    <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#f59e0b' }} />
                    <div style={{ fontSize: '12px', color: brand.secondary, flex: 1 }}>
                      {isEditing ? (<input type="number" value={data.stock.belowReorder} onChange={(e) => updateField('stock', 'belowReorder', parseInt(e.target.value) || 0)} style={{ width: '50px', padding: '2px 6px', fontSize: '12px', border: `2px solid ${brand.primary}`, borderRadius: '4px', marginRight: '4px' }} />) : (<strong style={{ color: brand.primary }}>{data.stock.belowReorder} SKUs</strong>)} below reorder point
                    </div>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', background: brand.light, borderRadius: '6px', padding: '10px' }}>
                    <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#3b82f6' }} />
                    <div style={{ fontSize: '12px', color: brand.secondary, flex: 1 }}>
                      {isEditing ? (<input type="number" value={data.stock.slowMoving} onChange={(e) => updateField('stock', 'slowMoving', parseInt(e.target.value) || 0)} style={{ width: '50px', padding: '2px 6px', fontSize: '12px', border: `2px solid ${brand.primary}`, borderRadius: '4px', marginRight: '4px' }} />) : (<strong style={{ color: brand.primary }}>{data.stock.slowMoving} SKUs</strong>)} slow-moving (&gt;90 days)
                    </div>
                  </div>
                </div>
              </div>
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                  <div style={{ fontSize: '10px', color: brand.secondary, textTransform: 'uppercase', letterSpacing: '0.5px' }}>Products with low cover</div>
                  {isEditing && data.stock.productIssues.length < 10 && (
                    <button onClick={addProductIssue} style={{ display: 'flex', alignItems: 'center', gap: '4px', padding: '4px 8px', background: brand.primary, color: 'white', border: 'none', borderRadius: '4px', fontSize: '11px', cursor: 'pointer' }}><Plus size={12} /> Add</button>
                  )}
                </div>
                <div style={{ maxHeight: '200px', overflowY: 'auto' }}>
                  {data.stock.productIssues.map((item, index) => (
                    <ProductIssueRow key={index} product={item.product} monthsCover={item.monthsCover} isEditing={isEditing} onProductChange={(v) => updateProductIssue(index, 'product', v)} onMonthsChange={(v) => updateProductIssue(index, 'monthsCover', v)} onDelete={() => removeProductIssue(index)} />
                  ))}
                  {data.stock.productIssues.length === 0 && !isEditing && (<div style={{ padding: '12px', background: brand.light, borderRadius: '6px', fontSize: '13px', color: brand.secondary, textAlign: 'center' }}>No products listed</div>)}
                </div>
              </div>
            </div>
          </Section>
        </div>
        <div style={{ textAlign: 'center', marginTop: '24px', padding: '16px', fontSize: '12px', color: brand.accent }}>Nutravet Monthly Operations Report • {currentMonth}</div>
      </div>
      <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } } @media (max-width: 1000px) { div[style*="grid-template-columns: repeat(3"] { grid-template-columns: repeat(2, 1fr) !important; } } @media (max-width: 700px) { div[style*="grid-template-columns: repeat(3"], div[style*="grid-template-columns: repeat(4"] { grid-template-columns: 1fr !important; } }`}</style>
    </div>
  )
}
