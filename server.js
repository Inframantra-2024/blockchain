require('dotenv').config();
const express = require('express');
const helmet = require('helmet');
const cors = require('cors');
const morgan = require('morgan');
const compression = require('compression');
const rateLimit = require('express-rate-limit');
const mongoSanitize = require('express-mongo-sanitize');
const xss = require('xss-clean');
const cookieParser = require('cookie-parser');
const config = require('config');
const swaggerJsdoc = require('swagger-jsdoc');
const swaggerUi = require('swagger-ui-express');
const connectDB = require('./config/db');
const authRoutes = require('./routes/authRoute.js');
const adminRoutes = require('./routes/adminRoute.js');
const merchantRoute = require('./routes/merchantRoute.js')
const errorHandler = require('./middleware/errorHandler.js');
const widthdrawalRoute = require('./routes/widthdrawalRoute.js')
const transactionRoute = require('./routes/transaction.js')
const feeRoutes = require('./routes/feeRoute.js')
const notificationRoutes = require('./routes/notificationRoute.js')


const app = express();
// External modules
const swaggerSpec = require('./config/swaggerConfig');
// const healthCheck = require('./middleware/healthCheck');

// Routes
// database 



// Middleware
app.use(cors({
  origin: ['http://localhost:3000', 'http://localhost:5000', 'http://142.93.223.225:5000'],
  credentials: true, // Allow cookies to be sent
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'x-api-secret']
}));
app.use(express.json());
app.use(cookieParser());

connectDB()


// Swagger with cookie support
const swaggerOptions = {
  swaggerOptions: {
    persistAuthorization: true,
    withCredentials: true,
    requestInterceptor: (request) => {
      // Include cookies in all requests
      request.credentials = 'include';
      return request;
    }
  },
  customCss: `
    .swagger-ui .topbar { display: none }
    .swagger-ui .info .title { color: #3b82f6; }
    .swagger-ui .scheme-container {
      background: #f8f9fa;
      padding: 10px;
      border-radius: 5px;
      margin: 10px 0;
    }
  `,
  customSiteTitle: "Crypto Payment Gateway API Documentation",
  customJs: `
    // Custom JavaScript to handle cookie authentication
    window.onload = function() {
      // Add a note about cookie authentication
      setTimeout(() => {
        const infoSection = document.querySelector('.swagger-ui .info');
        if (infoSection && !document.querySelector('#cookie-auth-note')) {
          const note = document.createElement('div');
          note.id = 'cookie-auth-note';
          note.innerHTML = \`
            <div style="background: #e3f2fd; padding: 15px; border-radius: 5px; margin: 15px 0; border-left: 4px solid #2196f3;">
              <h4 style="margin: 0 0 10px 0; color: #1976d2;">🍪 Cookie Authentication</h4>
              <p style="margin: 0; color: #424242;">
                After logging in via the <strong>/auth/login</strong> endpoint, your authentication cookie will be automatically
                included in subsequent requests. No need to manually set authorization headers for cookie-based auth.
              </p>
            </div>
          \`;
          infoSection.appendChild(note);
        }
      }, 1000);
    };
  `
};

app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec, swaggerOptions));

// Swagger JSON endpoint
app.get('/api-docs.json', (req, res) => {
  res.setHeader('Content-Type', 'application/json');
  res.send(swaggerSpec);
});

// Health check endpoint
app.get('/api/v1/health', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Crypto Payment Gateway API is running',
    timestamp: new Date().toISOString(),
    version: '1.0.0',
    services: {
      database: 'Connected',
      blockchain: 'Configured (Dummy USDT-TRC20)',
      notifications: 'Active',
      email: 'Ready'
    },
    apiDocs: {
      available: true,
      urls: [
        '/api-docs',
        '/api-docs.json'
      ]
    }
  });
});

// Simple test endpoint
app.get('/test', (req, res) => {
  res.json({
    success: true,
    message: 'Server is working!',
    timestamp: new Date().toISOString(),
    host: req.get('host'),
    protocol: req.protocol,
    url: req.url,
    baseUrl: `${req.protocol}://${req.get('host')}`
  });
});

// Health check
// app.get('/api/v1/health', healthCheck);

// Routes
// API Routes
app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/admin',adminRoutes);
app.use('/api/v1/fee',feeRoutes)
app.use('/api/v1/merchant',merchantRoute)
app.use('/api/v1/transaction',transactionRoute)
app.use('/api/v1/withdrawal',widthdrawalRoute)
app.use('/api/v1/notifications',notificationRoutes)

// Default route
app.get('/', (req, res) => {
  res.send('Welcome to the Crypto Payment Gateway API');
});

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 Server running at http://localhost:${PORT}`);
  console.log(`📚 Swagger docs: http://localhost:${PORT}/api-docs`);
});
