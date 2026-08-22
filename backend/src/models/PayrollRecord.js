const mongoose = require('mongoose');

const payrollRecordSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    salaryId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'SalaryStructure',
      required: true,
    },
    month: { type: Number, required: true, min: 1, max: 12 }, // 1-12
    year: { type: Number, required: true },
    grossPay: { type: Number, required: true },
    totalDeductions: { type: Number, default: 0 },
    netPay: { type: Number, required: true },
    status: {
      type: String,
      enum: ['PENDING', 'PROCESSED', 'PAID'],
      default: 'PENDING',
    },
    processedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
    processedAt: { type: Date, default: null },
  },
  { timestamps: true }
);

// One payroll record per employee per month/year
payrollRecordSchema.index({ userId: 1, month: 1, year: 1 }, { unique: true });

module.exports = mongoose.model('PayrollRecord', payrollRecordSchema);
