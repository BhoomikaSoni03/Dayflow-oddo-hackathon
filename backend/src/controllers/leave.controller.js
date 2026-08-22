const LeaveRequest = require('../models/LeaveRequest');
const Notification = require('../models/Notification');
const User = require('../models/User');

const calcDuration = (start, end) => {
  const s = new Date(start);
  const e = new Date(end);
  return Math.ceil((e - s) / (1000 * 60 * 60 * 24)) + 1;
};

// POST /api/leave/apply
const applyLeave = async (req, res) => {
  try {
    const { leaveType, startDate, endDate, reason } = req.body;
    if (!leaveType || !startDate || !endDate || !reason) {
      return res.status(400).json({ success: false, message: 'All fields are required' });
    }
    if (new Date(startDate) > new Date(endDate)) {
      return res.status(400).json({ success: false, message: 'Start date must be before end date' });
    }

    const durationDays = calcDuration(startDate, endDate);
    const leave = await LeaveRequest.create({
      employeeId: req.user._id,
      leaveType,
      startDate,
      endDate,
      durationDays,
      reason,
    });

    // Notify all admins
    const admins = await User.find({ role: 'ADMIN' });
    await Promise.all(
      admins.map((admin) =>
        Notification.create({
          recipientId: admin._id,
          title: 'New Leave Request',
          message: `Employee ${req.user.employeeId} submitted a ${leaveType} leave request for ${durationDays} day(s).`,
          type: 'LEAVE',
        })
      )
    );

    res.status(201).json({ success: true, message: 'Leave request submitted', leave });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// GET /api/leave/me
const getMyLeaves = async (req, res) => {
  try {
    const leaves = await LeaveRequest.find({ employeeId: req.user._id })
      .populate('reviewedBy', 'employeeId email')
      .sort({ createdAt: -1 });
    res.json({ success: true, count: leaves.length, leaves });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// GET /api/leave/all — Admin
const getAllLeaves = async (req, res) => {
  try {
    const { status } = req.query;
    const filter = {};
    if (status) filter.status = status;

    const leaves = await LeaveRequest.find(filter)
      .populate('employeeId', 'employeeId email')
      .populate('reviewedBy', 'employeeId email')
      .sort({ createdAt: -1 });
    res.json({ success: true, count: leaves.length, leaves });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// PATCH /api/leave/:id/review — Admin
const reviewLeave = async (req, res) => {
  try {
    const { status, hrComments } = req.body;
    if (!['APPROVED', 'REJECTED'].includes(status)) {
      return res.status(400).json({ success: false, message: 'Status must be APPROVED or REJECTED' });
    }

    const leave = await LeaveRequest.findById(req.params.id);
    if (!leave) return res.status(404).json({ success: false, message: 'Leave request not found' });
    if (leave.status !== 'PENDING') {
      return res.status(400).json({ success: false, message: 'Leave already reviewed' });
    }

    leave.status = status;
    leave.hrComments = hrComments || '';
    leave.reviewedBy = req.user._id;
    leave.reviewedAt = new Date();
    await leave.save();

    // Notify employee
    await Notification.create({
      recipientId: leave.employeeId,
      title: `Leave Request ${status}`,
      message: `Your ${leave.leaveType} leave request has been ${status.toLowerCase()}.${hrComments ? ` HR Comment: ${hrComments}` : ''}`,
      type: 'LEAVE',
    });

    res.json({ success: true, message: `Leave ${status.toLowerCase()} successfully`, leave });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

module.exports = { applyLeave, getMyLeaves, getAllLeaves, reviewLeave };
