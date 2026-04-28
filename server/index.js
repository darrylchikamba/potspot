import express from 'express';
import http from 'http';
import { Server } from 'socket.io';
import cors from 'cors';
import dotenv from 'dotenv';
import helmet from 'helmet';
import connectDB from './config/db.js';
import authRoutes from './routes/authRoutes.js';
import reportRoutes from './routes/reportRoutes.js';
import { generalLimiter } from './middleware/rateLimiters.js';

dotenv.config();

const frontendUrl = process.env.FRONTEND_URL;
const mongoUri = process.env.MONGO_URI;
const jwtSecret = process.env.JWT_SECRET;

if (!frontendUrl || !mongoUri || !jwtSecret) {
  console.error('FATAL: Missing critical environment variables. Exiting.');
  process.exit(1);
}

connectDB();

const app = express();
const server = http.createServer(app);

// 1. CORS first
const corsOptions = {
  origin: frontendUrl,
  credentials: true,
};
app.use(cors(corsOptions));

// 2. Helmet
app.use(helmet({
  crossOriginResourcePolicy: { policy: 'cross-origin' }
}));

// 3. Body parsers — must come before sanitiser
app.use(express.json({ limit: '10kb' }));
app.use(express.urlencoded({ extended: true, limit: '10kb' }));

// 4. Manual NoSQL sanitiser — runs after body is parsed
const sanitizeInput = (obj) => {
  if (obj && typeof obj === 'object') {
    Object.keys(obj).forEach(key => {
      if (key.startsWith('$') || key.includes('.')) {
        delete obj[key];
      } else {
        sanitizeInput(obj[key]);
      }
    });
  }
};

app.use((req, res, next) => {
  if (req.body) sanitizeInput(req.body);
  next();
});

// 5. Routes
app.use('/api/auth', authRoutes);
app.use('/api/reports', generalLimiter, reportRoutes);

app.get('/api/health', generalLimiter, (req, res) => {
  res.status(200).json({ status: 'ok', message: 'PotSpot Server running securely.' });
});

// 6. Socket.io
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