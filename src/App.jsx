import React, { useState, useEffect } from 'react'
import { TrendingUp, TrendingDown, CheckCircle, RefreshCw, ShoppingBag, CreditCard, Globe, Users, Monitor, Truck, Package, ExternalLink } from 'lucide-react'
import * as XLSX from 'xlsx'

// =====================================================
// YOUR ONEDRIVE LINK
// =====================================================
const ONEDRIVE_SHARE_LINK = 'https://onedrive.live.com/:x:/g/personal/648F2F7F0BD66099/IQD3_Nq3wITSRrx7FQwtdIS1AdCoTWz8vG4PbazbyitCLxM?resid=648F2F7F0BD66099!sb7dafcf784c046d2bc7b150c2d7484b5&ithint=file%2Cxlsx&e=GvGV8U&migratedtospo=true&redeem=aHR0cHM6Ly8xZHJ2Lm1zL3gvYy82NDhmMmY3ZjBiZDY2MDk5L0lRRDNfTnEzd0lUU1JyeDdGUXd0ZElTMUFkQ29UV3o4dkc0UGJhemJ5aXRDTHhNP2U9R3ZHVjhV'

// Nutravet brand colors
const brand = {
  brown: '#4a3728',
  brownLight: '#6b5344',
  brownLighter: '#8b7355',
  cream: '#f5f0eb',
  creamDark: '#e8e0d8',
}

// Default data
const defaultData = {
  reportMonth: 'March 2026',
  consumer: { tiktokGMV: 0, tiktokTarget: 50000, orders: 0, dispatchSLA: 0, responseTime: 0, reviewScore: 0 },
  trade: { outstandingDebt: 0, overdueInvoices: 0, avgDaysToPay: 0, orderFulfilment: 0 },
  international: { actualOrders: 0, forecastedOrders: 1, dataAccuracy: 0, forecastVariance: 0 },
  management: { nominations: 0, nominationTarget: 12, facilitiesTickets: 0, hsIncidents: 0, nearMisses: 0 },
  website: { adSpend: 0, adBudget: 15000, roas: 0, odooStatus: 'unknown' },
  suppliers: { ytdSpend: 0, lySpend: 1, activeSuppliers: 0, onTimeDelivery: 0, qualityPassRate: 0, ordersLastMonth: 0 },
  stock: { holdingValue: 0, avgMargin: 0, skusInStock: 0, expiryAlert: 0, belowReorder: 0, slowMoving: 0 },
  products: []
}

// Convert OneDrive share link to download link
const getDownloadUrl = (shareLink) => {
  if (!shareLink || shareLink === 'PASTE_YOUR_LINK_HERE') return null
  
  try {
    // For any OneDrive/1drv link, use the sharing API
    // Encode the share URL in base64 and use the OneDrive API
    const base64 = btoa(shareLink)
      .replace(/\+/g, '-')
      .replace(/\//g, '_')
      .replace(/=+$/, '')
    return `https://api.onedrive.com/v1.0/shares/u!${base64}/root/content`
  } catch (e) {
    console.error('Error creating download URL:', e)
    return null
  }
}

// Parse Excel data
const parseExcelData = (workbook) => {
  const sheet = workbook.Sheets[workbook.SheetNames[0]]
  const data = { ...defaultData, products: [] }
  
  // Field mapping from Excel labels to data structure
  const fieldMap = {
    'Report Month': (v) => { data.reportMonth = v },
    'TikTok GMV': (v) => { data.consumer.tiktokGMV = parseFloat(v) || 0 },
    'TikTok Target': (v) => { data.consumer.tiktokTarget = parseFloat(v) || 50000 },
    'Orders MTD': (v) => { data.consumer.orders = parseInt(v) || 0 },
    'Dispatch SLA': (v) => { data.consumer.dispatchSLA = parseFloat(v) || 0 },
    'Response Time': (v) => { data.consumer.responseTime = parseFloat(v) || 0 },
    'Review Score': (v) => { data.consumer.reviewScore = parseFloat(v) || 0 },
    'Outstanding Debt': (v) => { data.trade.outstandingDebt = parseFloat(v) || 0 },
    'Overdue Invoices': (v) => { data.trade.overdueInvoices = parseInt(v) || 0 },
    'Avg Days to Pay': (v) => { data.trade.avgDaysToPay = parseInt(v) || 0 },
    'Order Fulfilment': (v) => { data.trade.orderFulfilment = parseFloat(v) || 0 },
    'Actual Orders': (v) => { data.international.actualOrders = parseInt(v) || 0 },
    'Forecasted Orders': (v) => { data.international.forecastedOrders = parseInt(v) || 1 },
    'Data Accuracy': (v) => { data.international.dataAccuracy = parseFloat(v) || 0 },
    'Forecast Variance': (v) => { data.international.forecastVariance = parseFloat(v) || 0 },
    'Nominations': (v) => { data.management.nominations = parseInt(v) || 0 },
    'Nomination Target': (v) => { data.management.nominationTarget = parseInt(v) || 12 },
    'Facilities Tickets': (v) => { data.management.facilitiesTickets = parseInt(v) || 0 },
    'H&S Incidents': (v) => { data.management.hsIncidents = parseInt(v) || 0 },
    'Near Misses': (v) => { data.management.nearMisses = parseInt(v) || 0 },
    'Ad Spend': (v) => { data.website.adSpend = parseFloat(v) || 0 },
    'Ad Budget': (v) => { data.website.adBudget = parseFloat(v) || 15000 },
    'ROAS': (v) => { data.website.roas = parseFloat(v) || 0 },
    'Odoo Status': (v) => { data.website.odooStatus = v || 'unknown' },
    'YTD Spend': (v) => { data.suppliers.ytdSpend = parseFloat(v) || 0 },
    'Last Year Spend': (v) => { data.suppliers.lySpend = parseFloat(v) || 1 },
    'Active Suppliers': (v) => { data.suppliers.activeSuppliers = parseInt(v) || 0 },
    'On-Time Delivery': (v) => { data.suppliers.onTimeDelivery = parseFloat(v) || 0 },
    'Quality Pass Rate': (v) => { data.suppliers.qualityPassRate = parseFloat(v) || 0 },
    'Orders Last Month': (v) => { data.suppliers.ordersLastMonth = parseInt(v) || 0 },
    'Holding Value': (v) => { data.stock.holdingValue = parseFloat(v) || 0 },
    'Avg Margin': (v) => { data.stock.avgMargin = parseFloat(v) || 0 },
    'SKUs in Stock': (v) => { data.stock.skusInStock = parseInt(v) || 0 },
    'Expiry Alert': (v) => { data.stock.expiryAlert = parseInt(v) || 0 },
    'Below Reorder': (v) => { data.stock.belowReorder = parseInt(v) || 0 },
    'Slow Moving': (v) => { data.stock.slowMoving = parseInt(v) || 0 },
  }
  
  // Products mapping
  const productMap = {}
  for (let i = 1; i <= 10; i++) {
    fieldMap[`Product ${i}`] = (v) => { productMap[i] = { ...productMap[i], product: v || '' } }
    fieldMap[`Months Cover ${i}`] = (v) => { productMap[i] = { ...productMap[i], monthsCover: v || '' } }
  }
  
  // Read all rows
  const range = XLSX.utils.decode_range(sheet['!ref'] || 'A1:C100')
  for (let row = range.s.r; row <= range.e.r; row++) {
    const labelCell = sheet[XLSX.utils.encode_cell({ r: row, c: 0 })]
    const valueCell = sheet[XLSX.utils.encode_cell({ r: row, c: 1 })]
    
    if (labelCell && valueCell && fieldMap[labelCell.v]) {
      fieldMap[labelCell.v](valueCell.v)
    }
  }
  
  // Convert products to array
  data.products = Object.values(productMap).filter(p => p.product || p.monthsCover)
  
  return data
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
  const formatted = format === 'currency' ? `£${Number(value).toLocaleString()}` 
    : format === 'percent' ? `${value}%`
    : format === 'multiple' ? `${value}x`
    : Number(value).toLocaleString()
    
  return (
    <div style={{ background: brand.cream, borderRadius: '8px', padding: '12px' }}>
      <div style={{ fontSize: '10px', color: brand.brownLight, textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '4px' }}>{label}</div>
      <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px' }}>
        <span style={{ fontSize: '20px', fontWeight: 600, color: brand.brown }}>{formatted}</span>
        {trend !== undefined && (
          <span style={{ display: 'flex', alignItems: 'center', fontSize: '11px', color: trend >= 0 ? '#059669' : '#dc2626' }}>
            {trend >= 0 ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
            <span style={{ marginLeft: '2px' }}>{Math.abs(trend)}%</span>
          </span>
        )}
      </div>
      {subtext && <div style={{ fontSize: '10px', color: brand.brownLighter, marginTop: '2px' }}>{subtext}</div>}
    </div>
  )
}

const ProgressBar = ({ value, max }) => {
  const percent = Math.min((value / max) * 100, 100)
  return (
    <div style={{ height: '6px', background: brand.creamDark, borderRadius: '3px', overflow: 'hidden' }}>
      <div style={{ height: '100%', background: brand.brown, borderRadius: '3px', transition: 'all 0.5s', width: `${percent}%` }} />
    </div>
  )
}

const Section = ({ title, icon: Icon, children, fullWidth }) => {
  return (
    <div style={{
      background: 'white',
      borderRadius: '12px',
      border: `1px solid ${brand.creamDark}`,
      padding: '16px',
      gridColumn: fullWidth ? '1 / -1' : undefined,
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '14px', paddingBottom: '12px', borderBottom: `1px solid ${brand.cream}` }}>
        <div style={{
          width: '32px',
          height: '32px',
          borderRadius: '8px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: brand.cream,
          color: brand.brown,
        }}>
          <Icon size={16} />
        </div>
        <h3 style={{ fontSize: '14px', fontWeight: 600, color: brand.brown, margin: 0 }}>{title}</h3>
      </div>
      {children}
    </div>
  )
}

const AlertItem = ({ count, label, severity }) => {
  const colors = { danger: '#ef4444', warning: '#f59e0b', info: brand.brown }
  return (
    <div style={{ display: 'flex', alignItems: 'flex-start', gap: '8px', background: brand.cream, borderRadius: '8px', padding: '10px' }}>
      <div style={{ width: '8px', height: '8px', borderRadius: '50%', marginTop: '5px', flexShrink: 0, background: colors[severity] }} />
      <div style={{ fontSize: '12px', color: brand.brownLight, lineHeight: 1.4 }}>
        <strong style={{ color: brand.brown }}>{count} SKUs</strong> {label}
      </div>
    </div>
  )
}

const StatusRow = ({ label, value, thresholds, inverse, format, noBorder }) => {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 0', borderBottom: noBorder ? 'none' : `1px solid ${brand.cream}` }}>
      <span style={{ fontSize: '13px', color: brand.brownLight }}>{label}</span>
      <StatusBadge value={value} thresholds={thresholds} inverse={inverse} format={format} />
    </div>
  )
}

const ProductIssueRow = ({ product, monthsCover }) => {
  if (!product && !monthsCover) return null
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 12px', background: brand.cream, borderRadius: '6px', marginBottom: '6px' }}>
      <span style={{ fontSize: '13px', color: brand.brown, fontWeight: 500 }}>{product || '—'}</span>
      <span style={{ fontSize: '13px', color: brand.brownLight }}>{monthsCover ? `${monthsCover} months` : '—'}</span>
    </div>
  )
}

export default function App() {
  const [data, setData] = useState(defaultData)
  const [lastUpdated, setLastUpdated] = useState(new Date())
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState(null)

  const fetchData = async () => {
    const downloadUrl = getDownloadUrl(ONEDRIVE_SHARE_LINK)
    
    if (!downloadUrl) {
      setError('OneDrive link not configured.')
      setIsLoading(false)
      return
    }

    setIsLoading(true)
    setError(null)
    
    try {
      const response = await fetch(downloadUrl)
      if (!response.ok) throw new Error(`HTTP ${response.status}`)
      
      const arrayBuffer = await response.arrayBuffer()
      const workbook = XLSX.read(arrayBuffer, { type: 'array' })
      const parsedData = parseExcelData(workbook)
      
      setData(parsedData)
      setLastUpdated(new Date())
    } catch (err) {
      console.error('Error fetching data:', err)
      setError('Failed to load data. The file may not be shared publicly, or there may be a network issue. Try refreshing.')
    } finally {
      setIsLoading(false)
    }
  }

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
      <div style={{ minHeight: '100vh', background: brand.cream, display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif' }}>
        <div style={{ textAlign: 'center' }}>
          <RefreshCw size={32} style={{ animation: 'spin 1s linear infinite', color: brand.brown }} />
          <p style={{ marginTop: '12px', color: brand.brownLight }}>Loading dashboard...</p>
        </div>
        <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
      </div>
    )
  }

  return (
    <div style={{ minHeight: '100vh', background: brand.cream, padding: '20px', fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif' }}>
      <div style={{ maxWidth: '1400px', margin: '0 auto' }}>
        {/* Header */}
        <div style={{ background: 'white', borderRadius: '12px', border: `1px solid ${brand.creamDark}`, padding: '20px 24px', marginBottom: '20px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
              <svg width="140" height="36" viewBox="0 0 1000 120" style={{ marginRight: '8px' }}>
                <text x="0" y="90" style={{ fontFamily: 'Georgia, serif', fontSize: '100px', fontWeight: 'bold', fill: brand.brown }}>nutra</text>
                <text x="480" y="90" style={{ fontFamily: 'Georgia, serif', fontSize: '100px', fontWeight: 'normal', fill: brand.brownLighter }}>vet</text>
              </svg>
              <div style={{ borderLeft: `2px solid ${brand.creamDark}`, paddingLeft: '20px' }}>
                <h1 style={{ fontSize: '22px', fontWeight: 700, color: brand.brown, margin: 0 }}>Monthly Ops Report</h1>
                <p style={{ fontSize: '14px', color: brand.brownLight, margin: '4px 0 0' }}>{data.reportMonth}</p>
              </div>
            </div>
            <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
              <span style={{ fontSize: '12px', color: brand.brownLighter, marginRight: '8px' }}>
                Updated: {lastUpdated.toLocaleString()}
              </span>
              <a
                href={ONEDRIVE_SHARE_LINK}
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 16px',
                  background: brand.brown, border: 'none', borderRadius: '8px',
                  fontSize: '14px', fontWeight: 500, color: 'white', cursor: 'pointer',
                  textDecoration: 'none',
                }}
              >
                <ExternalLink size={16} /> Edit in Excel
              </a>
              <button
                onClick={fetchData}
                style={{
                  display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 16px',
                  background: 'white', border: `1px solid ${brand.creamDark}`, borderRadius: '8px',
                  fontSize: '14px', fontWeight: 500, color: brand.brownLight, cursor: 'pointer',
                }}
              >
                <RefreshCw size={16} /> Refresh
              </button>
            </div>
          </div>
        </div>

        {error && (
          <div style={{ background: '#fee2e2', border: '1px solid #fecaca', borderRadius: '8px', padding: '16px', marginBottom: '16px', color: '#b91c1c' }}>
            <strong>⚠️ {error}</strong>
          </div>
        )}

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px' }}>
          
          <Section title="Consumer insights" icon={ShoppingBag}>
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
              <StatusRow label="Dispatch SLA" value={data.consumer.dispatchSLA} thresholds={{ warning: 95, danger: 90 }} />
              <StatusRow label="Response time" value={data.consumer.responseTime} thresholds={{ warning: 4, danger: 6 }} inverse format="hrs" />
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 0' }}>
                <span style={{ fontSize: '13px', color: brand.brownLight }}>Review score</span>
                <span style={{ padding: '3px 8px', borderRadius: '6px', fontSize: '11px', fontWeight: 500, background: brand.cream, color: brand.brown }}>{data.consumer.reviewScore}/5</span>
              </div>
            </div>
          </Section>

          <Section title="Trade insights" icon={CreditCard}>
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
              <StatusRow label="Order fulfilment" value={data.trade.orderFulfilment} thresholds={{ warning: 97, danger: 95 }} noBorder />
            </div>
          </Section>

          <Section title="International" icon={Globe}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '10px', marginBottom: '12px' }}>
              <div style={{ background: brand.cream, borderRadius: '8px', padding: '12px' }}>
                <div style={{ fontSize: '10px', color: brand.brownLight, textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '4px' }}>Orders vs forecast</div>
                <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px' }}>
                  <span style={{ fontSize: '20px', fontWeight: 600, color: brand.brown }}>{variance > 0 ? '+' : ''}{variance}%</span>
                  {variance >= 0 ? <TrendingUp size={14} color="#059669" /> : <TrendingDown size={14} color="#dc2626" />}
                </div>
                <div style={{ fontSize: '11px', color: brand.brownLighter, marginTop: '4px' }}>
                  {data.international.actualOrders.toLocaleString()} actual vs {data.international.forecastedOrders.toLocaleString()} forecast
                </div>
              </div>
            </div>
            <div>
              <StatusRow label="Data accuracy" value={data.international.dataAccuracy} thresholds={{ warning: 95, danger: 90 }} />
              <StatusRow label="Forecast variance" value={data.international.forecastVariance} thresholds={{ warning: 10, danger: 15 }} inverse format="percent" noBorder />
            </div>
          </Section>

          <Section title="Management" icon={Users}>
            <div style={{ marginBottom: '14px' }}>
              <div style={{ fontSize: '10px', color: brand.brownLight, textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '8px' }}>Recognition scheme</div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', marginBottom: '4px' }}>
                <span style={{ color: brand.brownLight }}>Nominations this month</span>
                <span style={{ fontWeight: 600, color: brand.brown }}>{data.management.nominations}/{data.management.nominationTarget}</span>
              </div>
              <ProgressBar value={data.management.nominations} max={data.management.nominationTarget} />
            </div>
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 0', borderBottom: `1px solid ${brand.cream}` }}>
                <span style={{ fontSize: '13px', color: brand.brownLight }}>Facilities tickets open</span>
                <span style={{ padding: '3px 8px', borderRadius: '6px', fontSize: '11px', fontWeight: 500, background: '#fef3c7', color: '#b45309' }}>{data.management.facilitiesTickets}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 0', borderBottom: `1px solid ${brand.cream}` }}>
                <span style={{ fontSize: '13px', color: brand.brownLight }}>H&S incidents (MTD)</span>
                <span style={{ padding: '3px 8px', borderRadius: '6px', fontSize: '11px', fontWeight: 500, background: '#d1fae5', color: '#047857' }}>{data.management.hsIncidents}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 0' }}>
                <span style={{ fontSize: '13px', color: brand.brownLight }}>Near misses reported</span>
                <span style={{ padding: '3px 8px', borderRadius: '6px', fontSize: '11px', fontWeight: 500, background: brand.cream, color: brand.brown }}>{data.management.nearMisses}</span>
              </div>
            </div>
          </Section>

          <Section title="Website" icon={Monitor}>
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
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 0' }}>
                <span style={{ fontSize: '13px', color: brand.brownLight }}>Odoo sync status</span>
                <span style={{ padding: '3px 8px', borderRadius: '6px', fontSize: '11px', fontWeight: 500, background: '#d1fae5', color: '#047857', display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <CheckCircle size={10} /> {data.website.odooStatus}
                </span>
              </div>
            </div>
          </Section>

          <Section title="Suppliers" icon={Truck}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginBottom: '12px' }}>
              <MetricCard 
                label="YTD spend" 
                value={data.suppliers.ytdSpend} 
                format="currency"
                trend={data.suppliers.lySpend > 0 ? parseFloat(((data.suppliers.ytdSpend - data.suppliers.lySpend) / data.suppliers.lySpend * 100).toFixed(1)) : 0}
              />
              <MetricCard 
                label="Orders last month" 
                value={data.suppliers.ordersLastMonth}
                subtext={`${data.suppliers.activeSuppliers} suppliers`}
              />
            </div>
            <div>
              <StatusRow label="On-time delivery" value={data.suppliers.onTimeDelivery} thresholds={{ warning: 93, danger: 90 }} />
              <StatusRow label="Quality pass rate" value={data.suppliers.qualityPassRate} thresholds={{ warning: 97, danger: 95 }} noBorder />
            </div>
          </Section>

          <Section title="Stock" icon={Package} fullWidth>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '10px', marginBottom: '16px' }}>
              <MetricCard label="Holding value" value={data.stock.holdingValue} format="currency" />
              <MetricCard label="Avg margin" value={data.stock.avgMargin} format="percent" />
              <MetricCard label="SKUs in stock" value={data.stock.skusInStock} />
            </div>
            
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
              <div>
                <div style={{ fontSize: '10px', color: brand.brownLight, textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '10px' }}>Stock alerts</div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  <AlertItem count={data.stock.expiryAlert} label="approaching expiry (next 30 days)" severity="danger" />
                  <AlertItem count={data.stock.belowReorder} label="below reorder point" severity="warning" />
                  <AlertItem count={data.stock.slowMoving} label="with slow-moving flag (>90 days)" severity="info" />
                </div>
              </div>
              
              <div>
                <div style={{ fontSize: '10px', color: brand.brownLight, textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '10px' }}>Products with potential issues</div>
                <div style={{ maxHeight: '200px', overflowY: 'auto' }}>
                  {data.products && data.products.length > 0 ? (
                    data.products.map((item, index) => (
                      <ProductIssueRow key={index} product={item.product} monthsCover={item.monthsCover} />
                    ))
                  ) : (
                    <div style={{ fontSize: '13px', color: brand.brownLighter, fontStyle: 'italic', padding: '12px', background: brand.cream, borderRadius: '6px' }}>
                      No product issues listed
                    </div>
                  )}
                </div>
              </div>
            </div>
          </Section>

        </div>
        
        <div style={{ textAlign: 'center', marginTop: '24px', fontSize: '12px', color: brand.brownLighter }}>
          © {new Date().getFullYear()} Nutravet · Monthly Operations Report
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
