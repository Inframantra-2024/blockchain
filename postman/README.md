# 🚀 Crypto Payment Gateway API - Postman Collection

This directory contains a complete Postman collection for testing the Crypto Payment Gateway API.

## 📁 Files Included

- `Crypto_Payment_Gateway_API.postman_collection.json` - Main API collection
- `Crypto_Gateway_Environment.postman_environment.json` - Environment variables
- `README.md` - This documentation file

## 🔧 Setup Instructions

### 1. Import Collection and Environment

1. **Open Postman**
2. **Import Collection**:
   - Click "Import" button
   - Select `Crypto_Payment_Gateway_API.postman_collection.json`
   - Click "Import"

3. **Import Environment**:
   - Click "Import" button
   - Select `Crypto_Gateway_Environment.postman_environment.json`
   - Click "Import"

4. **Select Environment**:
   - In the top-right corner, select "Crypto Gateway Environment"

### 2. Configure Base URL

The environment is pre-configured with:
- **Production**: `http://142.93.223.225:5000`
- **Local**: `http://localhost:5000`

To switch between environments, update the `baseUrl` variable in the environment.

## 📋 API Endpoints Included

### 🔐 Authentication
- **Register Merchant** - Create new merchant account
- **Login Merchant** - Login and get auth token (auto-saves token)
- **Logout** - Logout current session

### 💰 Transactions
- **Create Transaction** - Generate payment request (auto-saves transaction ID)
- **Confirm Deposit** - Confirm payment received
- **Check Transaction Status** - Get transaction status
- **Get Transaction History** - View transaction history

### 🏦 Withdrawals
- **Initiate Withdrawal** - Request withdrawal (auto-saves withdrawal ID)
- **Get Withdrawal History** - View withdrawal history
- **Approve Withdrawal (Admin)** - Approve pending withdrawal
- **Reject Withdrawal (Admin)** - Reject pending withdrawal

### 🔔 Notifications (Admin Only)
- **Get All Notifications** - View all admin notifications
- **Get Notification Summary** - Dashboard summary
- **Mark Notification as Read** - Mark notification as read

### 📊 Statistics (Admin Only)
- **Platform Overview** - Complete platform statistics
- **All Merchants Statistics** - Statistics for all merchants
- **Specific Merchant Statistics** - Statistics for specific merchant

### ⚙️ Fee Management (Admin Only)
- **Get Fee Settings** - Current fee configuration
- **Update Fee Settings** - Modify withdrawal fees

### 👤 Merchant Management
- **Get Merchant Profile** - View merchant details
- **Update Merchant Profile** - Update merchant information
- **Get Merchant Balance** - Check current balance

### 🔍 System
- **Health Check** - Server status
- **Test Endpoint** - Basic connectivity test
- **API Docs Debug** - Debug API documentation

## 🔑 Authentication Flow

### For Merchants:
1. **Register** using "Register Merchant" request
2. **Login** using "Login Merchant" request
   - Auth token will be automatically saved to environment
   - API key will be automatically saved to environment
3. Use the saved tokens for authenticated requests

### For Admins:
1. Login with admin credentials
2. Manually set the `adminToken` environment variable
3. Use admin endpoints

## 🧪 Testing Workflow

### Complete Transaction Flow:
1. **Register/Login** as merchant
2. **Create Transaction** (saves transaction ID automatically)
3. **Check Transaction Status** 
4. **Confirm Deposit** (simulates payment)
5. **Check Transaction Status** again

### Withdrawal Flow:
1. **Login** as merchant
2. **Check Balance** 
3. **Initiate Withdrawal** (saves withdrawal ID)
4. **Login as Admin** and **Approve/Reject Withdrawal**

### Admin Monitoring:
1. **Login as Admin**
2. **View Platform Overview**
3. **Check Notifications**
4. **View Merchant Statistics**

## 🔧 Environment Variables

The collection uses these environment variables:

| Variable | Description | Auto-Set |
|----------|-------------|----------|
| `baseUrl` | API base URL | ✅ |
| `authToken` | Merchant auth token | ✅ (on login) |
| `adminToken` | Admin auth token | ❌ (manual) |
| `apiKey` | Merchant API key | ✅ (on login) |
| `transactionId` | Current transaction ID | ✅ (on create) |
| `walletAddress` | Generated wallet address | ✅ (on create) |
| `withdrawalId` | Current withdrawal ID | ✅ (on initiate) |
| `merchantId` | Merchant ID | ❌ (manual) |
| `notificationId` | Notification ID | ❌ (manual) |

## 📝 Sample Test Data

### Test Merchant:
- **Email**: `merchant@example.com`
- **Password**: `password123`
- **Wallet**: `TQn9Y2khEsLJW1ChVWFMSMeRDow5KcbLSE`

### Test Admin:
- **Email**: `admin@example.com`
- **Password**: `admin123`

## 🎯 Quick Start

1. **Import both files** into Postman
2. **Select the environment**
3. **Run "Health Check"** to verify server is running
4. **Register a new merchant** or use test credentials
5. **Login** to get authentication tokens
6. **Create a transaction** to test the payment flow
7. **Explore other endpoints** as needed

## 🔍 Troubleshooting

### Common Issues:

1. **401 Unauthorized**:
   - Make sure you're logged in
   - Check if auth token is set in environment
   - Verify token hasn't expired

2. **404 Not Found**:
   - Check if server is running
   - Verify base URL is correct
   - Ensure endpoint path is correct

3. **500 Server Error**:
   - Check server logs
   - Verify database connection
   - Check request body format

### Debug Endpoints:
- Use **Health Check** to verify server status
- Use **Test Endpoint** for basic connectivity
- Use **API Docs Debug** for troubleshooting

## 🌐 Server URLs

- **Production**: `http://142.93.223.225:5000`
- **Local Development**: `http://localhost:5000`
- **API Documentation**: `http://142.93.223.225:5000/api-docs`

## 📚 Additional Resources

- **Swagger Documentation**: Available at `/api-docs`
- **Health Check**: Available at `/api/v1/health`
- **Server Logs**: Check PM2 logs for detailed information

---

🎉 **Happy Testing!** This collection covers all API endpoints with proper authentication and automatic variable management.
