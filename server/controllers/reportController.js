import mongoose from 'mongoose';
import Report from '../models/Report.js';
import { io } from '../index.js';

// @desc    Fetch all active reports
// @route   GET /api/reports
// @access  Private
export const getReports = async (req, res) => {
  try {
    const reports = await Report.find({}).populate('user', 'username email');
    res.json(reports);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Fetch single report by ID
// @route   GET /api/reports/:id
// @access  Private
export const getReportById = async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(404).json({ message: 'Invalid report ID or Report not found' });
    }

    const report = await Report.findById(req.params.id).populate('user', 'username email');

    if (report) {
      res.json(report);
    } else {
      res.status(404).json({ message: 'Report not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Create new report
// @route   POST /api/reports
// @access  Private
export const createReport = async (req, res) => {
  try {
    const { location, category, severity, description, address } = req.body;

    if (!category) {
      return res.status(400).json({ message: 'Category is required' });
    }

    const allowedCategories = ['pothole', 'flooding', 'accident', 'road_closure', 'other'];
    if (!allowedCategories.includes(category)) {
      return res.status(400).json({ message: `Invalid category. Allowed values are: ${allowedCategories.join(', ')}` });
    }

    if (severity) {
      const allowedSeverities = ['low', 'medium', 'high'];
      if (!allowedSeverities.includes(severity)) {
        return res.status(400).json({ message: `Invalid severity. Allowed values are: ${allowedSeverities.join(', ')}` });
      }
    }

    if (description && description.length > 300) {
      return res.status(400).json({ message: 'Description cannot exceed 300 characters' });
    }

    if (!location || !location.coordinates) {
      return res.status(400).json({ message: 'Location with coordinates is required' });
    }

    const { coordinates } = location;
    if (!Array.isArray(coordinates) || coordinates.length !== 2) {
      return res.status(400).json({ message: 'Coordinates must be an array of exactly two numbers [longitude, latitude]' });
    }

    const [longitude, latitude] = coordinates;
    if (typeof longitude !== 'number' || typeof latitude !== 'number') {
      return res.status(400).json({ message: 'Coordinates must be numbers' });
    }

    if (longitude < -180 || longitude > 180) {
      return res.status(400).json({ message: 'Longitude must be between -180 and 180' });
    }

    if (latitude < -90 || latitude > 90) {
      return res.status(400).json({ message: 'Latitude must be between -90 and 90' });
    }

    const report = new Report({
      location,
      category,
      severity: severity || 'medium',
      description,
      address,
      user: req.user._id,
      expiresAt: new Date(Date.now() + 48 * 60 * 60 * 1000), // 48 hours from now
    });

    const createdReport = await report.save();

    // Emit real-time event
    io.emit('new_report', createdReport);

    res.status(201).json(createdReport);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Toggle upvote on report
// @route   PUT /api/reports/:id/upvote
// @access  Private
export const toggleUpvote = async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(404).json({ message: 'Invalid report ID or Report not found' });
    }

    const report = await Report.findById(req.params.id);

    if (!report) {
      return res.status(404).json({ message: 'Report not found' });
    }

    const userId = req.user._id;
    const hasUpvoted = report.upvotes.includes(userId);

    if (hasUpvoted) {
      // Remove upvote
      report.upvotes = report.upvotes.filter((id) => id.toString() !== userId.toString());
    } else {
      // Add upvote
      report.upvotes.push(userId);
    }

    const updatedReport = await report.save();

    // Emit real-time upvote event
    io.emit('upvote_updated', { reportId: req.params.id, upvotes: report.upvotes });

    res.json(updatedReport);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Mark report as resolved
// @route   PUT /api/reports/:id/resolve
// @access  Private
export const resolveReport = async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(404).json({ message: 'Invalid report ID or Report not found' });
    }

    const report = await Report.findById(req.params.id);

    if (!report) {
      return res.status(404).json({ message: 'Report not found' });
    }

    // Ownership check
    if (report.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'User not authorized to resolve this report' });
    }

    report.status = 'resolved';
    const updatedReport = await report.save();

    res.json(updatedReport);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Delete report
// @route   DELETE /api/reports/:id
// @access  Private
export const deleteReport = async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(404).json({ message: 'Invalid report ID or Report not found' });
    }

    const report = await Report.findById(req.params.id);

    if (!report) {
      return res.status(404).json({ message: 'Report not found' });
    }

    // Ownership check
    if (report.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'User not authorized to delete this report' });
    }

    await Report.deleteOne({ _id: report._id });
    res.json({ message: 'Report removed successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
