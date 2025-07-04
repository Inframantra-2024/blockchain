# Crypto Payment Gateway API

A comprehensive cryptocurrency payment gateway that facilitates USDT transactions between users and clients, managed by Super Admin with complete transaction monitoring and fund release controls.

## 🚀 Features

- **Multi-Role System**: Super Admin, Admin, and Merchant roles with specific permissions
- **Crypto Transactions**: Support for USDT-TRC20 and USDT-ERC20 transactions
- **Real-time Monitoring**: 10-minute transaction confirmation window with blockchain monitoring
- **API Integration**: RESTful API for merchant integration with comprehensive documentation
- **Withdrawal Management**: Controlled fund release with configurable fee structures
- **Security**: JWT authentication, rate limiting, input validation, and comprehensive logging
- **Beginner-Friendly**: Simplified blockchain service with hardcoded values for easy testing
- **Wallet Management**: Automatic wallet generation and validation for all supported currencies
- **Transaction Monitoring**: Automated 10-minute timer with real-time status updates
- **Demo Scripts**: Interactive testing tools to understand system functionality

## 📋 Requirements

- Node.js 16+
- MongoDB 4.4+
- npm or yarn

## 🛠️ Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd nodejs-secure-api
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Environment Configuration**
   Create a `.env` file in the root directory:
   ```env
   NODE_ENV=development
   PORT=5000
   MONGO_URI=mongodb://localhost:27017/crypto-gateway
   JWT_SECRET=your-super-secret-jwt-key

   # Email Configuration (for password reset)
   EMAIL_HOST=smtp.gmail.com
   EMAIL_PORT=587
   EMAIL_USER=your-email@gmail.com
   EMAIL_PASS=your-app-password
   ```

4. **Start the application**
   ```bash
   # Development mode
   npm run dev

   # Production mode
   npm start
   ```

5. **Test the blockchain service (Optional)**
   ```bash
   # Run the demo script to see how blockchain service works
   node demo/testBlockchain.js
   ```

## 📚 API Documentation

### Interactive Documentation
Once the server is running, access the comprehensive Swagger API documentation at:
```
http://localhost:5000/api-docs
```

### Base URL
```
Development: http://localhost:5000/api/v1
Production: https://your-domain.com/api/v1
```

## 🔐 Authentication

The API uses multiple authentication methods:

1. **JWT Bearer Token** (for web dashboard)
   ```
   Authorization: Bearer <jwt-token>
   ```

2. **Cookie Authentication** (for web sessions)
   ```
   Cookie: token=<jwt-token>
   ```

3. **API Key Authentication** (for merchant integrations)
   ```
   Headers:
   x-api-secret: <merchant-api-secret>
   ```

## 🏗️ System Architecture

### User Roles

1. **Super Admin**
   - Manages the entire platform
   - Registers and manages clients/merchants
   - Generates API credentials
   - Monitors all transactions
   - Releases funds to merchants
   - Sets transaction fees

2. **Admin**
   - Approves/blocks merchants
   - Views all transactions
   - Manages withdrawals
   - Configures fee settings

3. **Merchant**
   - Integrates API into their platform
   - Receives crypto deposits
   - Requests fund withdrawals
   - Views transaction history

### Transaction Flow

1. **Merchant Integration**: Merchant integrates API using provided credentials
2. **Transaction Initiation**: End user initiates deposit through merchant platform
3. **Wallet Generation**: System generates unique wallet address for transaction
4. **Countdown Timer**: 10-minute confirmation window starts
5. **Blockchain Monitoring**: System monitors for fund receipt
6. **Status Update**: Transaction marked as success/failed
7. **Fund Credit**: Successful funds credited to Super Admin wallet
8. **Withdrawal Process**: Merchant requests withdrawal, Admin approves

## 🔧 API Endpoints Overview

### Authentication
- `POST /auth/register` - Register new merchant (Admin only)
- `POST /auth/login` - User login
- `POST /auth/logout` - User logout
- `PUT /auth/change-password` - Change password
- `POST /auth/forgot-password` - Request password reset
- `POST /auth/reset-password/:token` - Reset password

### Transactions
- `GET /transaction/:apiKey/create` - Create new transaction
- `POST /transaction/:apiKey/deposite` - Confirm deposit
- `GET /transaction/:apiKey/status/:transactionId` - Check transaction status

### Withdrawals
- `POST /withdrawal` - Request withdrawal (Merchant)
- `PATCH /withdrawal/:id` - Approve/reject withdrawal (Admin)
- `GET /withdrawal` - List all withdrawals (Admin)
- `GET /withdrawal/merchant/:id` - Get merchant withdrawals (Admin)

### Fee Management
- `POST /fee` - Create fee setting (Admin)
- `GET /fee` - List fee settings (Admin)
- `GET /fee/:id` - Get fee setting (Admin)
- `PUT /fee/:id` - Update fee setting (Admin)
- `DELETE /fee/:id` - Delete fee setting (Admin)

### Admin Management
- `PATCH /admin/approve/:userId` - Approve merchant (Admin)
- `PATCH /admin/block/:userId` - Block merchant (Admin)

### Merchant Management
- `GET /merchant` - List all merchants (Admin)
- `GET /merchant/:id` - Get merchant details
- `GET /merchant/:id/transactions` - Get merchant transactions

## 💾 Database Schema

### User Model
```javascript
{
  name: String,
  email: String (unique),
  password: String (hashed),
  role: ['merchant', 'user', 'admin', 'superadmin'],
  approved: ['pending', 'approved', 'rejected', 'block'],
  apiKey: String,
  apiSecret: String,
  walletAddress: String,
  totalAmt: Number
}
```

### Transaction Model
```javascript
{
  merchantId: ObjectId,
  transactionId: String (unique),
  amount: Number,
  walletAddress: String,
  currencyType: ['USDT-TRC20', 'USDT-ERC20'],
  status: ['pending', 'success', 'failed', 'api_failed', 'initiated'],
  expiresAt: Date
}
```

### Withdrawal Model
```javascript
{
  merchantId: ObjectId,
  amount: Number,
  feeAmount: Number,
  netAmount: Number,
  feeId: ObjectId,
  status: ['pending', 'approved', 'rejected', 'cancelled']
}
```

### Fee Model
```javascript
{
  feeType: ['percentage', 'flat'],
  value: Number
}
```

## 🔒 Security Features

- **Helmet.js**: Security headers
- **Rate Limiting**: Prevents API abuse
- **Input Validation**: Express-validator for request validation
- **XSS Protection**: Cross-site scripting prevention
- **MongoDB Injection**: Protection against NoSQL injection
- **CORS**: Cross-origin resource sharing configuration
- **JWT**: Secure token-based authentication
- **Password Hashing**: bcrypt for password security

## 📊 Logging

The application uses Winston for comprehensive logging:
- **Console Logging**: Development environment
- **File Logging**: Production environment
- **Error Tracking**: Separate error log file
- **Request Logging**: Morgan for HTTP request logging

## 🧪 Testing

```bash
# Test blockchain service functionality
node demo/testBlockchain.js

# Run unit tests (when implemented)
npm test

# Run tests with coverage
npm run test:coverage
```

## 📚 Documentation

- **[Beginner's Guide](docs/BEGINNER_GUIDE.md)** - Simple explanation of how everything works
- **[API Reference](docs/API_REFERENCE.md)** - Quick API reference with examples
- **[Swagger Documentation](http://localhost:5000/api-docs)** - Interactive API documentation

## 🚀 Deployment

### Production Checklist
- [ ] Set `NODE_ENV=production`
- [ ] Configure production MongoDB URI
- [ ] Set secure JWT secret
- [ ] Configure email service
- [ ] Set up SSL/TLS certificates
- [ ] Configure reverse proxy (nginx)
- [ ] Set up monitoring and logging
- [ ] Configure backup strategy

### Docker Deployment
```dockerfile
# Dockerfile example
FROM node:16-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
EXPOSE 5000
CMD ["npm", "start"]
```

## 📈 Monitoring

- **Health Checks**: Implement health check endpoints
- **Performance Monitoring**: Monitor API response times
- **Error Tracking**: Centralized error logging
- **Database Monitoring**: MongoDB performance metrics

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Create a Pull Request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 📞 Support

For support and questions:
- Email: support@cryptogateway.com
- Documentation: http://localhost:5000/api-docs
- Issues: Create an issue in the repository

## 🔄 Version History

- **v1.0.0** - Initial release with core functionality
  - User authentication and authorization
  - Transaction management
  - Withdrawal system
  - Fee management
  - Comprehensive API documentation
