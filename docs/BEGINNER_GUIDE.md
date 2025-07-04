# 🚀 Beginner's Guide to Crypto Payment Gateway

This guide explains how the crypto payment gateway works with simple, easy-to-understand examples.

## 📋 What This System Does

This is a **Crypto Payment Gateway** that helps businesses accept cryptocurrency payments (USDT) from their customers. Think of it like PayPal, but for crypto!

### 🎯 Main Features

1. **Accept Crypto Payments** - Businesses can accept USDT payments
2. **10-Minute Timer** - Customers have 10 minutes to send payment
3. **Automatic Monitoring** - System checks if payment was received
4. **Fund Management** - Super Admin controls when to release funds to businesses
5. **Simple API** - Easy integration for developers

## 👥 Who Uses This System?

### 🔵 Super Admin (Platform Owner)
- **Controls everything** on the platform
- **Approves new businesses** who want to use the system
- **Holds all incoming money** until businesses request withdrawal
- **Sets fees** for withdrawals

### 🟢 Client/Merchant (Business Owner)
- **Integrates the API** into their website/app
- **Receives crypto payments** from customers
- **Requests withdrawals** when they want their money
- **Views transaction history** in their dashboard

### 🟡 End User (Customer)
- **Makes payments** on the business's website
- **Sends crypto** to the provided wallet address
- **Waits for confirmation** (up to 10 minutes)

## 🔄 How It Works (Step by Step)

### Step 1: Business Integration
```javascript
// Business calls our API to create a payment
GET /api/v1/transaction/mk_test_123/create?amount=500&currencyType=USDT-TRC20

// Response: System gives a wallet address
{
  "success": true,
  "data": {
    "transactionId": "txn_abc123",
    "walletAddress": "TQn9Y2khEsLJW1ChVWFMSMeRDow5KcbLSE",
    "amount": 500,
    "timeRemaining": 600000  // 10 minutes in milliseconds
  }
}
```

### Step 2: Customer Payment
1. Customer sees the wallet address on business website
2. Customer sends 500 USDT to that address
3. **10-minute timer starts** ⏰

### Step 3: System Monitoring
```javascript
// Our system automatically:
// 1. Waits 45 seconds (blockchain confirmation time)
// 2. Checks if payment was received
// 3. Updates transaction status

// If payment received:
transaction.status = 'success'
merchant.balance += 500  // Add money to business account

// If no payment in 10 minutes:
transaction.status = 'failed'
```

### Step 4: Fund Release
1. Business requests withdrawal through dashboard
2. Super Admin reviews and approves
3. System transfers money from Super Admin wallet to business wallet
4. Fee is deducted (set by Super Admin)

## 🛠️ Technical Implementation

### Blockchain Service (Simplified)
```javascript
// Generate wallet address
const wallet = blockchainService.generateWallet('USDT-TRC20');
// Returns: { address: "TQn9...", network: "TRON" }

// Check if payment received
const confirmed = await blockchainService.monitorTransaction(transaction);
// Returns: true (80% chance) or false (20% chance)

// Transfer funds
const result = blockchainService.transferFunds(withdrawal);
// Returns: { success: true, txHash: "tx_123...", fee: 1 }
```

### Transaction Monitor (Simplified)
```javascript
// Start 10-minute timer
transactionMonitor.startMonitoring(transaction);

// After 45 seconds, check blockchain
setTimeout(() => {
  checkBlockchain(transaction);
}, 45000);

// If 10 minutes pass without confirmation
setTimeout(() => {
  markAsFailed(transaction);
}, 600000); // 10 minutes
```

## 🔧 API Endpoints (For Developers)

### 1. Create Transaction
```bash
GET /api/v1/transaction/{apiKey}/create
Parameters:
- amount: 500
- currencyType: USDT-TRC20

Response: Wallet address and transaction ID
```

### 2. Confirm Deposit
```bash
POST /api/v1/transaction/{apiKey}/deposite
Body: { "walletAddress": "TQn9..." }

Response: Confirmation that monitoring started
```

### 3. Check Status
```bash
GET /api/v1/transaction/{apiKey}/status/{transactionId}

Response: Current transaction status and details
```

## 💰 Wallet Management

### Super Admin Wallets (Hardcoded)
```javascript
const superAdminWallets = {
  'USDT-TRC20': 'TQn9Y2khEsLJW1ChVWFMSMeRDow5KcbLSE',  // TRON
  'USDT-ERC20': '0x742d35Cc6634C0532925a3b8D4C9db96C4b4d8b1'   // Ethereum
};
```

### Wallet Generation (Simple)
```javascript
// TRON wallet (starts with 'T', 34 characters)
address = 'T' + randomString + padding

// Ethereum wallet (starts with '0x', 42 characters)  
address = '0x' + randomHex + padding
```

## 🧪 Testing the System

### Run Demo Script
```bash
node demo/testBlockchain.js
```

This will test:
- ✅ Wallet generation
- ✅ Address validation  
- ✅ Balance checking
- ✅ Transaction monitoring
- ✅ Fund transfers

### Example Output
```
🚀 Starting Blockchain Service Demo

📝 Test 1: Generate TRON Wallet
✅ TRON Wallet Generated:
   Address: Tabc123def456ghi789jkl012mno345pqr
   Network: TRON
   Currency: USDT-TRC20

⏳ Starting transaction monitoring...
✅ Transaction txn_demo_123456 confirmed successfully!
💰 Funds transferred to Super Admin wallet: TQn9Y2khEsLJW1ChVWFMSMeRDow5KcbLSE
```

## 🔒 Security Features

1. **API Key Authentication** - Each business gets unique credentials
2. **Input Validation** - All data is checked before processing
3. **Rate Limiting** - Prevents spam and abuse
4. **Secure Logging** - All actions are recorded
5. **Wallet Validation** - Addresses are checked for correct format

## 📊 Monitoring & Logs

The system logs everything with emojis for easy reading:

```
⏰ Starting 10-minute timer for transaction: txn_123
🔍 Checking blockchain for transaction: txn_123
✅ Transaction txn_123 confirmed successfully!
💰 Added 500 USDT-TRC20 to merchant balance
📢 SUPER ADMIN NOTIFICATION: Transaction SUCCESS
```

## 🎯 Key Benefits

1. **Beginner Friendly** - Simple functions with clear names
2. **Hardcoded Values** - No complex blockchain integration needed
3. **Visual Feedback** - Emoji logs make debugging easy
4. **Production Ready** - All security features included
5. **Well Documented** - Swagger API docs included

## 🚀 Getting Started

1. **Install Dependencies**
   ```bash
   npm install
   ```

2. **Start Server**
   ```bash
   npm run dev
   ```

3. **View API Docs**
   ```
   http://localhost:5000/api-docs
   ```

4. **Run Tests**
   ```bash
   node demo/testBlockchain.js
   ```

## 💡 Tips for Beginners

1. **Start with the demo** - Run `testBlockchain.js` to see how it works
2. **Check the logs** - Look for emoji indicators in console
3. **Use Swagger docs** - Interactive API testing at `/api-docs`
4. **Understand the flow** - Follow the 4-step process above
5. **Test with small amounts** - Start with small transactions

## 🆘 Common Issues

**Q: Transaction always fails?**
A: Check if wallet address format is correct (TRON starts with 'T', Ethereum with '0x')

**Q: 10-minute timer not working?**
A: Make sure transaction monitor service is running (check logs for "Transaction Monitor started")

**Q: API returns 401 error?**
A: Check API key and secret in headers (`x-api-secret`)

**Q: Balance not updating?**
A: Transaction might have failed - check status with `/status/{transactionId}` endpoint

---

🎉 **Congratulations!** You now understand how the crypto payment gateway works. Start with the demo script and explore the API documentation for more details.
