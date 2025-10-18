# Fuzemon Backend API

A Node.js backend API for managing limit orders in the Fuzemon application, built with Express, TypeScript, and MongoDB.

## API Endpoints

### Orders
- `POST /api/orders` - Create a new order
- `GET /api/orders` - Get all orders (with pagination and filtering)
- `GET /api/orders/:id` - Get order by ID
- `PUT /api/orders/:id` - Update order
- `PATCH /api/orders/:id/status` - Update order status
- `DELETE /api/orders/:id` - Delete order
- `GET /api/orders/user/:address` - Get orders by user address
- `GET /api/orders/hash/:hash` - Get order by order hash

### Health Check
- `GET /health` - Server health status

## Installation

1. **Clone and navigate to backend directory:**
   ```bash
   cd backend
   ```

2. **Install dependencies:**
   ```bash
   yarn install
   ```

3. **Set up environment variables:**
   ```bash
   cp env.example .env
   # Edit .env with your configuration
   ```

4. **Start MongoDB:**
   - Local: `mongod`
   - Docker: `docker run -d -p 27017:27017 --name mongodb mongo:latest`
   - Atlas: Use connection string in `.env`

## Development

```bash
# Development mode with hot reload
yarn dev

# Build TypeScript
yarn build

# Start production server
yarn start
```

## Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `PORT` | Server port | 5001 |
| `NODE_ENV` | Environment | development |
| `MONGODB_URI` | MongoDB connection string | mongodb://localhost:27017/fuzemon |
| `FRONTEND_URL` | Frontend URL for CORS | http://localhost:3000 |

## API Usage Examples

### Create Order
```bash
curl -X POST http://localhost:5001/api/orders \
  -H "Content-Type: application/json" \
  -d '{
    "swapState": {
      "fromChain": 1,
      "toChain": 137,
      "fromToken": {
        "symbol": "ETH",
        "name": "Ethereum",
        "address": "0x0000000000000000000000000000000000000000",
        "decimals": 18
      },
      "toToken": {
        "symbol": "USDC",
        "name": "USD Coin",
        "address": "0x2791Bca1f2de4661ED88A30C99A7a9449Aa84174",
        "decimals": 6
      },
      "fromAmount": "1000000000000000000",
      "toAmount": "2000000000",
      "userAddress": "0x1234567890123456789012345678901234567890"
    },
    "fromToken": {
      "symbol": "ETH",
      "name": "Ethereum",
      "address": "0x0000000000000000000000000000000000000000",
      "decimals": 18
    },
    "toToken": {
      "symbol": "USDC",
      "name": "USD Coin",
      "address": "0x2791Bca1f2de4661ED88A30C99A7a9449Aa84174",
      "decimals": 6
    }
  }'
```

### Get Orders
```bash
curl "http://localhost:5001/api/orders?page=1&limit=10&status=CREATED"
```

### Update Order Status
```bash
curl -X PATCH http://localhost:5001/api/orders/{orderId}/status \
  -H "Content-Type: application/json" \
  -d '{
    "status": "COMPLETED",
    "message": "Order completed successfully"
  }'
```

## Project Structure

```
backend/
├── src/
│   ├── controllers/     # Route controllers
│   ├── middleware/      # Custom middleware
│   ├── models/         # Mongoose models
│   ├── routes/         # API routes
│   ├── types/          # TypeScript types
│   ├── utils/          # Utility functions
│   ├── app.ts          # Express app configuration
│   └── server.ts       # Server entry point
├── package.json
├── tsconfig.json
└── README.md
```

## License

MIT
