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
const connectDB = require('./config/db');
const authRoutes = require('./routes/authRoute.js');
const errorHandler = require('./middleware/errorHandler.js');

const app = express();

// Connect to MongoDB
connectDB();

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

// Routes
app.use('/api/v1', authRoutes);

// Error handling middleware
app.use(errorHandler);


// Start server
const PORT = process.env.PORT || config.get('port') || 5000;
app.listen(PORT, () => {
  console.log(`Server running in ${process.env.NODE_ENV} mode on port ${PORT}`);
});
