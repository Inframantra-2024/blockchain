const mongoose = require('mongoose');
const dotenv = require('dotenv');
const config = require('config');


const logger = require('../logger/logger.js');

const connectDB = async () => {
  try {
    const mongoURI =process.env.MONGO_URI|| config.get('MONGO_URI');

    await mongoose.connect(mongoURI, {
      ssl: true,
      serverApi: { version: '1', strict: true, deprecationErrors: true },
    });

    logger.info('MongoDB Connected...');
    console.log('MongoDB connected successfully');
  } catch (err) {
    console.error('MongoDB connection error:', err.message);
    process.exit(1);
  }
};

module.exports = connectDB;
