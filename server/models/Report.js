import mongoose from 'mongoose';

const reportSchema = new mongoose.Schema(
  {
    location: {
      type: {
        type: String,
        enum: ['Point'],
        required: true,
      },
      coordinates: {
        type: [Number], // [longitude, latitude]
        required: true,
      },
    },
    category: {
      type: String,
      enum: ['pothole', 'flooding', 'accident', 'road_closure', 'other'],
      required: true,
    },
    severity: {
      type: String,
      enum: ['low', 'medium', 'high'],
      default: 'medium',
    },
    description: {
      type: String,
      maxlength: 300,
    },
    address: {
      type: String,
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    upvotes: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
      },
    ],
    status: {
      type: String,
      enum: ['active', 'resolved'],
      default: 'active',
    },
    expiresAt: {
      type: Date,
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

// Indexes
reportSchema.index({ location: '2dsphere' });
reportSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

const Report = mongoose.model('Report', reportSchema);
export default Report;
