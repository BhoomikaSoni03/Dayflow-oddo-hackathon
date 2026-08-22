const mongoose = require('mongoose');

const employeeProfileSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true,
    },
    firstName: { type: String, required: true, trim: true },
    lastName: { type: String, required: true, trim: true },
    dateOfBirth: { type: Date },
    phoneNumber: { type: String, trim: true },
    address: { type: String, trim: true },
    profilePicture: { type: String, default: '' },
    department: { type: String, trim: true, default: 'General' },
    designation: { type: String, trim: true, default: 'Employee' },
    employmentType: {
      type: String,
      enum: ['FULL_TIME', 'PART_TIME', 'CONTRACT'],
      default: 'FULL_TIME',
    },
    joiningDate: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

module.exports = mongoose.model('EmployeeProfile', employeeProfileSchema);
