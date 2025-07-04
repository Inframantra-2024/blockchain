# API Reference Guide

## Base URL
```
Development: http://localhost:5000/api/v1
Production: https://your-domain.com/api/v1
```

## Authentication

### JWT Bearer Token
```
Authorization: Bearer <jwt-token>
```

### API Key (for merchants)
```
Headers:
x-api-secret: <merchant-api-secret>
```

## Quick Start

### 1. Admin Login
```bash
POST /auth/login
{
  "email": "admin@example.com",
  "password": "password123"
}
```

### 2. Register Merchant
```bash
POST /auth/register
Authorization: Bearer <admin-token>
{
  "name": "John Doe",
  "email": "merchant@example.com",
  "password": "password123",
  "confirmPassword": "password123"
}
```

### 3. Approve Merchant
```bash
PATCH /admin/approve/{userId}
Authorization: Bearer <admin-token>
```

### 4. Create Transaction (Merchant API)
```bash
GET /transaction/{apiKey}/create?amount=500&currencyType=USDT-TRC20
x-api-secret: <merchant-api-secret>
```

### 5. Confirm Deposit
```bash
POST /transaction/{apiKey}/deposite
x-api-secret: <merchant-api-secret>
{
  "walletAddress": "TQn9Y2khEsLJW1ChVWFMSMeRDow5KcbLSE"
}
```

## Response Format

### Success Response
```json
{
  "success": true,
  "message": "Operation successful",
  "data": { ... },
  "error": null
}
```

### Error Response
```json
{
  "success": false,
  "message": "Error message",
  "error": "Detailed error",
  "errors": "Validation errors"
}
```

## Status Codes

- `200` - Success
- `201` - Created
- `400` - Bad Request
- `401` - Unauthorized
- `403` - Forbidden
- `404` - Not Found
- `500` - Internal Server Error

## Rate Limiting

- **Window**: 15 minutes
- **Max Requests**: 100 per window
- **Headers**: 
  - `X-RateLimit-Limit`
  - `X-RateLimit-Remaining`
  - `X-RateLimit-Reset`

## Pagination

Query parameters for paginated endpoints:
- `page` - Page number (default: 1)
- `limit` - Items per page (default: 10, max: 100)

Response includes:
```json
{
  "pagination": {
    "totalRecords": 100,
    "totalPages": 10,
    "currentPage": 1,
    "limit": 10
  }
}
```

## Error Handling

### Validation Errors
```json
{
  "success": false,
  "message": "Validation failed",
  "errors": "Email is required"
}
```

### Authentication Errors
```json
{
  "success": false,
  "message": "Not authorized",
  "error": "Invalid token"
}
```

## Webhook Integration (Future)

For real-time transaction updates:
```json
{
  "event": "transaction.completed",
  "data": {
    "transactionId": "txn_123",
    "status": "success",
    "amount": 500,
    "merchantId": "merchant_456"
  }
}
```

## SDK Examples

### JavaScript/Node.js
```javascript
const axios = require('axios');

const api = axios.create({
  baseURL: 'http://localhost:5000/api/v1',
  headers: {
    'x-api-secret': 'your-api-secret'
  }
});

// Create transaction
const transaction = await api.get('/transaction/your-api-key/create', {
  params: {
    amount: 500,
    currencyType: 'USDT-TRC20'
  }
});
```

### PHP
```php
$curl = curl_init();

curl_setopt_array($curl, array(
  CURLOPT_URL => 'http://localhost:5000/api/v1/transaction/your-api-key/create?amount=500&currencyType=USDT-TRC20',
  CURLOPT_RETURNTRANSFER => true,
  CURLOPT_HTTPHEADER => array(
    'x-api-secret: your-api-secret'
  ),
));

$response = curl_exec($curl);
curl_close($curl);
```

### Python
```python
import requests

headers = {
    'x-api-secret': 'your-api-secret'
}

params = {
    'amount': 500,
    'currencyType': 'USDT-TRC20'
}

response = requests.get(
    'http://localhost:5000/api/v1/transaction/your-api-key/create',
    headers=headers,
    params=params
)
```

## Testing

### Postman Collection
Import the Postman collection for easy API testing:
```
docs/Crypto_Payment_Gateway.postman_collection.json
```

### Environment Variables
```json
{
  "base_url": "http://localhost:5000/api/v1",
  "admin_token": "{{admin_jwt_token}}",
  "merchant_api_key": "{{merchant_api_key}}",
  "merchant_api_secret": "{{merchant_api_secret}}"
}
```

## Security Best Practices

1. **Always use HTTPS in production**
2. **Store API secrets securely**
3. **Implement proper error handling**
4. **Validate all inputs**
5. **Monitor API usage**
6. **Rotate API keys regularly**
7. **Use rate limiting**
8. **Log all transactions**

## Support

- **Documentation**: http://localhost:5000/api-docs
- **Email**: support@cryptogateway.com
- **GitHub Issues**: Create an issue for bugs or feature requests
