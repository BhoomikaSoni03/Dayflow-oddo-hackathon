const mongoose = require('mongoose');

const salaryStructureSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true,
    },
    basicSalary: { type: Number, default: 0 },
    allowances: {
      house: { type: Number, default: 0 },
      transport: { type: Number, default: 0 },
      medical: { type: Number, default: 0 },
      other: { type: Number, default: 0 },
    },
    deductions: { type: Number, default: 0 },
    netSalary: { type: Number, default: 0 },
    currency: { type: String, default: 'INR' },
    effectiveFrom: { type: Date, default: Date.now },
    updatedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
  },
  { timestamps: true }
);

// Auto-calculate netSalary before save
salaryStructureSchema.pre('save', function (next) {
  const totalAllowances =
    this.allowances.house +
    this.allowances.transport +
    this.allowances.medical +
    this.allowances.other;
  this.netSalary = this.basicSalary + totalAllowances - this.deductions;
  next();
});

module.exports = mongoose.model('SalaryStructure', salaryStructureSchema);
