const mongoose = require('mongoose');

const attendanceSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    date: {
      type: String, // stored as YYYY-MM-DD for easy querying
      required: true,
    },
    checkIn: { type: String, default: null }, // HH:MM:SS
    checkOut: { type: String, default: null },
    status: {
      type: String,
      enum: ['PRESENT', 'ABSENT', 'HALF_DAY', 'LEAVE'],
      default: 'ABSENT',
    },
    workHours: { type: Number, default: 0 },
    remarks: { type: String, default: '' },
  },
  { timestamps: true }
);

// Compound unique index — one record per employee per day
attendanceSchema.index({ userId: 1, date: 1 }, { unique: true });

module.exports = mongoose.model('Attendance', attendanceSchema);
