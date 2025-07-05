require('dotenv').config();
const express = require('express');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const swaggerUi = require('swagger-ui-express');

// External modules
const swaggerSpec = require('./config/swaggerConfig');
// const healthCheck = require('./middleware/healthCheck');

// Routes
const authRoutes = require('./routes/authRoute');

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(cookieParser());

// Swagger
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));
app.get('/api-docs.json', (req, res) => {
  res.setHeader('Content-Type', 'application/json');
  res.send(swaggerSpec);
});

// Health check
// app.get('/api/v1/health', healthCheck);

// Routes
app.use('/api/v1/auth', authRoutes);

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
