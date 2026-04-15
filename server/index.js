import express from 'express';
import http from 'http';
import { Server } from 'socket.io';
import cors from 'cors';
import dotenv from 'dotenv';
import helmet from 'helmet';
import mongoSanitize from 'express-mongo-sanitize';

import connectDB from './config/db.js';
import authRoutes from './routes/authRoutes.js';
import reportRoutes from './routes/reportRoutes.js';
import { generalLimiter } from './middleware/rateLimiters.js';

dotenv.config();

// Strict Environment Variable Checks
const frontendUrl = process.env.FRONTEND_URL;
const mongoUri = process.env.MONGO_URI;
const jwtSecret = process.env.JWT_SECRET;

if (!frontendUrl || !mongoUri || !jwtSecret) {
  console.error('FATAL: Missing critical environment variables (FRONTEND_URL, MONGO_URI, or JWT_SECRET). Exiting.');
  process.exit(1);
}

// Connect to MongoDB
connectDB();

const app = express();
const server = http.createServer(app);

// Security Middleware
app.use(helmet()); // Set standard HTTP headers
app.use(mongoSanitize()); // Prevent NoSQL injection

// CORS configuration - Restricted to FRONTEND_URL
const corsOptions = {
  origin: frontendUrl,
  credentials: true,
};
app.use(cors(corsOptions));

// Body Parser with 10kb limit
app.use(express.json({ limit: '10kb' }));
app.use(express.urlencoded({ extended: true, limit: '10kb' }));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/reports', generalLimiter, reportRoutes);

// Health check route
app.get('/api/health', generalLimiter, (req, res) => {
  res.status(200).json({ status: 'ok', message: 'PotSpot Server running securely.' });
});

// Socket.io Setup
export const io = new Server(server, {
  cors: corsOptions,
});

io.on('connection', (socket) => {
  console.log('A client connected:', socket.id);
  
  socket.on('disconnect', () => {
    console.log('Client disconnected:', socket.id);
  });
});

const PORT = process.env.PORT || 5000;

server.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});
