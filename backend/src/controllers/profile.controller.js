const EmployeeProfile = require('../models/EmployeeProfile');
const User = require('../models/User');

// GET /api/profile/me
const getMyProfile = async (req, res) => {
  try {
    const profile = await EmployeeProfile.findOne({ userId: req.user._id }).populate('userId', 'employeeId email role');
    if (!profile) return res.status(404).json({ success: false, message: 'Profile not found' });
    res.json({ success: true, profile });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// PATCH /api/profile/me — Employee: limited fields only
const updateMyProfile = async (req, res) => {
  try {
    const allowed = ['phoneNumber', 'address', 'profilePicture'];
    const updates = {};
    allowed.forEach((field) => {
      if (req.body[field] !== undefined) updates[field] = req.body[field];
    });

    const profile = await EmployeeProfile.findOneAndUpdate(
      { userId: req.user._id },
      updates,
      { new: true, runValidators: true }
    );
    res.json({ success: true, profile });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// GET /api/profile/all — Admin only
const getAllProfiles = async (req, res) => {
  try {
    const profiles = await EmployeeProfile.find()
      .populate('userId', 'employeeId email role isVerified createdAt')
      .sort({ createdAt: -1 });
    res.json({ success: true, count: profiles.length, profiles });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// GET /api/profile/:userId — Admin only
const getProfileById = async (req, res) => {
  try {
    const profile = await EmployeeProfile.findOne({ userId: req.params.userId }).populate(
      'userId',
      'employeeId email role isVerified'
    );
    if (!profile) return res.status(404).json({ success: false, message: 'Profile not found' });
    res.json({ success: true, profile });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// PATCH /api/profile/:userId — Admin only
const updateProfileById = async (req, res) => {
  try {
    const allowed = [
      'firstName', 'lastName', 'dateOfBirth', 'phoneNumber', 'address',
      'profilePicture', 'department', 'designation', 'employmentType', 'joiningDate',
    ];
    const updates = {};
    allowed.forEach((field) => {
      if (req.body[field] !== undefined) updates[field] = req.body[field];
    });

    const profile = await EmployeeProfile.findOneAndUpdate(
      { userId: req.params.userId },
      updates,
      { new: true, runValidators: true }
    );
    if (!profile) return res.status(404).json({ success: false, message: 'Profile not found' });
    res.json({ success: true, profile });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

module.exports = { getMyProfile, updateMyProfile, getAllProfiles, getProfileById, updateProfileById };
