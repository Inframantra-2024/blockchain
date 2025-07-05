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
app.use(cors());
app.use(express.json());
app.use(cookieParser());

connectDB()


// Swagger
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));
app.get('/api-docs.json', (req, res) => {
  res.setHeader('Content-Type', 'application/json');
  res.send(swaggerSpec);
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
