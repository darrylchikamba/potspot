import express from 'express';
import { registerUser, loginUser } from '../controllers/authController.js';
import { authLimiter } from '../middleware/rateLimiters.js';

const router = express.Router();

// Apply stringent rate limiter specifically to auth routes
router.use(authLimiter);

router.post('/register', registerUser);
router.post('/login', loginUser);

export default router;
