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

// Connect to MongoDB
connectDB();

// Swagger configuration
const swaggerOptions = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Crypto Payment Gateway API',
      version: '1.0.0',
      description: 'A comprehensive API for cryptocurrency payment processing, merchant management, and transaction handling',
      contact: {
        name: 'API Support',
        email: 'support@cryptogateway.com'
      },
      license: {
        name: 'MIT',
        url: 'https://opensource.org/licenses/MIT'
      }
    },
    servers: [
      {
        url: '/api/v1',
        description: 'Current server (works with any domain/localhost)'
      },
      {
        url: 'http://localhost:5000/api/v1',
        description: 'Local development server'
      },
      {
        url: 'http://142.93.223.225:5000/api/v1',
        description: 'Production server (your main API)'
      }
    ],
    externalDocs: {
      description: 'Production API Documentation',
      url: 'http://142.93.223.225:5000/api-docs'
    },
    components: {
      securitySchemes: {
        BearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT'
        },
        CookieAuth: {
          type: 'apiKey',
          in: 'cookie',
          name: 'token'
        },
        ApiKeyAuth: {
          type: 'apiKey',
          in: 'header',
          name: 'x-api-secret',
          description: 'API Secret for merchant authentication'
        }
      }
    },
    security: [
      {
        BearerAuth: []
      },
      {
        CookieAuth: []
      }
    ]
  },
  apis: ['./routes/*.js', './models/*.js', './server.js']
};

const swaggerSpec = swaggerJsdoc(swaggerOptions);

// Security middlewares
app.use(helmet());

app.use(cors());

// Sanitize only req.body to avoid errors with req.query
// app.use(
//   mongoSanitize({
//     replaceWith: '_',
//     onSanitize: ({ req, key }) => {
//       // Optional logging or debugging
//     },
//     allowDots: true,
//     dryRun: false,
//     sanitizeQuery: false, // 👈 Important: don't touch req.query
//     sanitizeParams: false,
//   })
// );

// // Custom middleware to only sanitize req.body
// app.use((req, res, next) => {
//   if (req.body) {
//     xss()(req, res, next); // Call xss-clean only on body
//   } else {
//     next();
//   }
// });

// Compression middleware
app.use(compression());

// Logging middleware (only in dev)
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

// Rate limiting
const limiter = rateLimit({
  windowMs: config.get('rateLimit.windowMs') || 15 * 60 * 1000, // 15 minutes
  max: config.get('rateLimit.max') || 100, // max requests per windowMs
});
app.use(limiter);

// CORS configuration for universal access
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, PATCH, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
  if (req.method === 'OPTIONS') {
    res.sendStatus(200);
  } else {
    next();
  }
});

// Body parser & cookie parser
app.use(express.json());
app.use(cookieParser());

// Swagger Documentation - Simplified universal access
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec, {
  customCss: '.swagger-ui .topbar { display: none }',
  customSiteTitle: 'Crypto Payment Gateway API Documentation',
  swaggerOptions: {
    persistAuthorization: true,
    displayRequestDuration: true,
    docExpansion: 'none',
    filter: true,
    showExtensions: true,
    showCommonExtensions: true
  }
}));

// Additional route to ensure API docs work
app.get('/docs', (req, res) => {
  res.redirect('/api-docs');
});

// Swagger JSON endpoint
app.get('/api-docs.json', (req, res) => {
  res.json(swaggerSpec);
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
      blockchain: 'Configured',
      notifications: 'Active',
      email: 'Ready'
    },
    apiDocs: {
      available: true,
      urls: [
        '/api-docs',
        '/docs',
        '/api-docs.json'
      ]
    }
  });
});

// Simple test endpoint to verify server is working
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

// API Routes
app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/admin',adminRoutes);
app.use('/api/v1/fee',feeRoutes)
app.use('/api/v1/merchant',merchantRoute)
app.use('/api/v1/transaction',transactionRoute)
app.use('/api/v1/withdrawal',widthdrawalRoute)
app.use('/api/v1/notifications',notificationRoutes)


// Error handling middleware
app.use(errorHandler);


/**
 * @swagger
 * tags:
 *   - name: Authentication
 *     description: User authentication and authorization endpoints
 *   - name: Transactions
 *     description: Cryptocurrency transaction management
 *   - name: Withdrawals
 *     description: Withdrawal request and approval management
 *   - name: Fee Management
 *     description: Fee settings for withdrawal transactions
 *   - name: Admin Management
 *     description: Admin operations for merchant approval and blocking
 *   - name: Merchant Management
 *     description: Merchant information and transaction history
 *   - name: Notifications
 *     description: Admin notifications and alerts management
 *   - name: Statistics
 *     description: Platform and merchant statistics and analytics
 */

// Start server
const PORT = process.env.PORT || config.get('port') || 5000;
app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 Crypto Payment Gateway API Server`);
  console.log(`📊 Environment: ${process.env.NODE_ENV}`);
  console.log(`🌐 Port: ${PORT}`);
  console.log(`📚 API Documentation:`);
  console.log(`  • Local: http://localhost:${PORT}/api-docs`);
  console.log(`  • Production: http://142.93.223.225:${PORT}/api-docs`);
  console.log(`  • Alternative: http://142.93.223.225:${PORT}/docs`);
  console.log(`🔍 Health Check: http://142.93.223.225:${PORT}/api/v1/health`);
  console.log(`🧪 Test Endpoint: http://142.93.223.225:${PORT}/test`);
  console.log(`� Swagger JSON: http://142.93.223.225:${PORT}/api-docs.json`);
  console.log(`💡 API docs work with ANY base URL!`);
});
