import express, { Application } from "express";
import cors from "cors";
import helmet from "helmet";
import { errorHandler, notFound } from "./middleware/errorHandler";
import orderRoutes from "./routes/orderRoutes";
import smartWalletRoutes from "./routes/smartWalletRoutes";

const app: Application = express();

// Security middleware
app.use(helmet());

// Rate limiting disabled for local development

// CORS configuration - Allow all origins for local development
app.use(
  cors({
    origin: true, // Allow all origins for local development
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
    allowedHeaders: [
      "Content-Type",
      "Authorization",
      "X-Requested-With",
      "Accept",
    ],
  })
);

// Body parsing middleware
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));

// Health check endpoint
app.get("/health", (req, res) => {
  res.status(200).json({
    success: true,
    message: "Fuzemon Backend API is running",
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || "development",
  });
});

// API routes
app.use("/api/orders", orderRoutes);
app.use("/api/smart-wallet", smartWalletRoutes);

// 404 handler
app.use(notFound);

// Error handling middleware (must be last)
app.use(errorHandler);

export default app;
