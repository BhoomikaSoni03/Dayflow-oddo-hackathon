const User = require('../models/User');
const Attendance = require('../models/Attendance');
const LeaveRequest = require('../models/LeaveRequest');
const SalaryStructure = require('../models/SalaryStructure');
const PayrollRecord = require('../models/PayrollRecord');
const EmployeeProfile = require('../models/EmployeeProfile');

// GET /api/reports/dashboard — Admin analytics
const getDashboard = async (req, res) => {
  try {
    const today = new Date().toISOString().split('T')[0];

    const [
      totalEmployees,
      todayAttendance,
      pendingLeaves,
      approvedLeaves,
      rejectedLeaves,
      allSalaries,
    ] = await Promise.all([
      User.countDocuments({ role: 'EMPLOYEE' }),
      Attendance.find({ date: today }),
      LeaveRequest.countDocuments({ status: 'PENDING' }),
      LeaveRequest.countDocuments({ status: 'APPROVED' }),
      LeaveRequest.countDocuments({ status: 'REJECTED' }),
      SalaryStructure.find(),
    ]);

    const presentToday = todayAttendance.filter((r) => r.status === 'PRESENT').length;
    const absentToday = todayAttendance.filter((r) => r.status === 'ABSENT').length;
    const halfDayToday = todayAttendance.filter((r) => r.status === 'HALF_DAY').length;
    const onLeaveToday = todayAttendance.filter((r) => r.status === 'LEAVE').length;
    const totalPayroll = allSalaries.reduce((sum, s) => sum + s.netSalary, 0);

    res.json({
      success: true,
      dashboard: {
        totalEmployees,
        presentToday,
        absentToday,
        halfDayToday,
        onLeaveToday,
        pendingLeaves,
        approvedLeaves,
        rejectedLeaves,
        totalPayroll,
        today,
      },
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// GET /api/reports/attendance?from=&to=
const getAttendanceReport = async (req, res) => {
  try {
    const { from, to, userId } = req.query;
    const filter = {};
    if (from && to) filter.date = { $gte: from, $lte: to };
    if (userId) filter.userId = userId;

    const records = await Attendance.find(filter)
      .populate('userId', 'employeeId email')
      .sort({ date: -1 });

    const summary = {
      total: records.length,
      present: records.filter((r) => r.status === 'PRESENT').length,
      absent: records.filter((r) => r.status === 'ABSENT').length,
      halfDay: records.filter((r) => r.status === 'HALF_DAY').length,
      leave: records.filter((r) => r.status === 'LEAVE').length,
    };

    res.json({ success: true, summary, records });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// GET /api/reports/leave
const getLeaveReport = async (req, res) => {
  try {
    const { status, leaveType } = req.query;
    const filter = {};
    if (status) filter.status = status;
    if (leaveType) filter.leaveType = leaveType;

    const leaves = await LeaveRequest.find(filter)
      .populate('employeeId', 'employeeId email')
      .populate('reviewedBy', 'employeeId')
      .sort({ createdAt: -1 });

    res.json({ success: true, count: leaves.length, leaves });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// GET /api/reports/payroll
const getPayrollReport = async (req, res) => {
  try {
    const { month, year } = req.query;
    const filter = {};
    if (month) filter.month = Number(month);
    if (year) filter.year = Number(year);

    const records = await PayrollRecord.find(filter)
      .populate('userId', 'employeeId email')
      .sort({ year: -1, month: -1 });

    const totalNetPay = records.reduce((sum, r) => sum + r.netPay, 0);
    res.json({ success: true, count: records.length, totalNetPay, records });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

module.exports = { getDashboard, getAttendanceReport, getLeaveReport, getPayrollReport };
