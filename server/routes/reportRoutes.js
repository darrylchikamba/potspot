import express from 'express';
import { protect } from '../middleware/auth.js';
import {
  getReports,
  getReportById,
  createReport,
  toggleUpvote,
  resolveReport,
  deleteReport,
} from '../controllers/reportController.js';

const router = express.Router();

// Apply protect middleware to all routes in this router
router.use(protect);

router.route('/')
  .get(getReports)
  .post(createReport);

router.route('/:id')
  .get(getReportById)
  .delete(deleteReport);

router.put('/:id/upvote', toggleUpvote);
router.put('/:id/resolve', resolveReport);

export default router;
