const mysql = require('mysql2/promise');

module.exports = async function handler(req, res) {
  // CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET');
  
  let connection;
  
  try {
    // Connect to your MySQL database
    connection = await mysql.createConnection({
      host: process.env.DB_HOST,
      port: process.env.DB_PORT || 3306,
      database: process.env.DB_NAME,
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      ssl: { rejectUnauthorized: false }
    });

    // ============================================================
    // CUSTOMIZE THESE QUERIES TO MATCH YOUR DATABASE TABLES
    // ============================================================
    
    // Example queries - replace with your actual table/column names
    const [consumerRows] = await connection.execute(`
      SELECT 
        SUM(order_total) as tiktokGMV,
        COUNT(*) as orders
      FROM orders 
      WHERE order_date >= DATE_FORMAT(NOW(), '%Y-%m-01')
    `);

    const [tradeRows] = await connection.execute(`
      SELECT 
        SUM(amount_outstanding) as outstandingDebt,
        COUNT(CASE WHEN due_date < CURDATE() THEN 1 END) as overdueInvoices,
        AVG(DATEDIFF(paid_date, invoice_date)) as avgDaysToPay
      FROM invoices
      WHERE status != 'paid' OR paid_date >= DATE_FORMAT(NOW(), '%Y-%m-01')
    `);

    const [stockRows] = await connection.execute(`
      SELECT 
        SUM(quantity * unit_cost) as holdingValue,
        AVG(margin_percent) as avgMargin,
        COUNT(DISTINCT sku) as skusInStock
      FROM inventory
      WHERE quantity > 0
    `);

    // Build response with data from queries
    const data = {
      consumer: {
        tiktokGMV: consumerRows[0]?.tiktokGMV || 0,
        tiktokTarget: 50000,
        orders: consumerRows[0]?.orders || 0,
        dispatchSLA: 96.5,
        responseTime: 3.2,
        reviewScore: 4.7,
        returnRate: 3.8,
      },
      trade: {
        outstandingDebt: tradeRows[0]?.outstandingDebt || 0,
        overdueInvoices: tradeRows[0]?.overdueInvoices || 0,
        avgDaysToPay: Math.round(tradeRows[0]?.avgDaysToPay || 0),
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
        regions: [
          { name: 'EU', orders: 412, forecast: 400 },
          { name: 'USA', orders: 285, forecast: 300 },
          { name: 'APAC', orders: 142, forecast: 120 },
          { name: 'ROW', orders: 53, forecast: 30 },
        ]
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
        channels: [
          { name: 'Google Ads', spend: 5200, revenue: 23400 },
          { name: 'Meta', spend: 4800, revenue: 18200 },
          { name: 'TikTok', spend: 2450, revenue: 11200 },
        ]
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
        holdingValue: stockRows[0]?.holdingValue || 0,
        avgMargin: stockRows[0]?.avgMargin || 0,
        skusInStock: stockRows[0]?.skusInStock || 0,
        daysOnHand: 52,
        expiryAlert: 23,
        belowReorder: 45,
        slowMoving: 89,
      },
      lastUpdated: new Date().toISOString(),
    };

    res.status(200).json(data);
    
  } catch (error) {
    console.error('Database error:', error);
    res.status(500).json({ error: 'Failed to fetch data', details: error.message });
  } finally {
    if (connection) await connection.end();
  }
};
