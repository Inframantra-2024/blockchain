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
        url: process.env.NODE_ENV === 'production'
          ? 'https://api.cryptogateway.com/api/v1'
          : `http://localhost:${process.env.PORT || 5000}/api/v1`,
        description: process.env.NODE_ENV === 'production' ? 'Production server' : 'Development server'
      },
      {
        url: 'http://142.93.223.225:5000/api/v1',
        description: ' API server'
      }
    ],
    externalDocs: {
      description: 'API Documentation',
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

// Body parser & cookie parser
app.use(express.json());
app.use(cookieParser());

// Swagger Documentation
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
app.listen(PORT, () => {
  console.log(`Server running in ${process.env.NODE_ENV} mode on port ${PORT}`);
  console.log(`API Documentation available at: http://localhost:${PORT}/api-docs`);
});
