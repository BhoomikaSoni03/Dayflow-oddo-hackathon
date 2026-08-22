const Attendance = require('../models/Attendance');
const EmployeeProfile = require('../models/EmployeeProfile');

const getTodayDate = () => new Date().toISOString().split('T')[0];

const getTimeNow = () => {
  const now = new Date();
  return now.toTimeString().split(' ')[0]; // HH:MM:SS
};

// POST /api/attendance/checkin
const checkIn = async (req, res) => {
  try {
    const today = getTodayDate();
    const existing = await Attendance.findOne({ userId: req.user._id, date: today });
    if (existing && existing.checkIn) {
      return res.status(400).json({ success: false, message: 'Already checked in today' });
    }

    let record;
    if (existing) {
      existing.checkIn = getTimeNow();
      existing.status = 'PRESENT';
      record = await existing.save();
    } else {
      record = await Attendance.create({
        userId: req.user._id,
        date: today,
        checkIn: getTimeNow(),
        status: 'PRESENT',
      });
    }
    res.status(201).json({ success: true, message: 'Checked in successfully', record });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// PATCH /api/attendance/checkout
const checkOut = async (req, res) => {
  try {
    const today = getTodayDate();
    const record = await Attendance.findOne({ userId: req.user._id, date: today });
    if (!record || !record.checkIn) {
      return res.status(400).json({ success: false, message: 'You have not checked in today' });
    }
    if (record.checkOut) {
      return res.status(400).json({ success: false, message: 'Already checked out today' });
    }

    record.checkOut = getTimeNow();
    // Calculate work hours
    const [inH, inM, inS] = record.checkIn.split(':').map(Number);
    const [outH, outM, outS] = record.checkOut.split(':').map(Number);
    const inSec = inH * 3600 + inM * 60 + inS;
    const outSec = outH * 3600 + outM * 60 + outS;
    record.workHours = parseFloat(((outSec - inSec) / 3600).toFixed(2));
    if (record.workHours < 4) record.status = 'HALF_DAY';

    await record.save();
    res.json({ success: true, message: 'Checked out successfully', record });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// GET /api/attendance/me?week=true
const getMyAttendance = async (req, res) => {
  try {
    const { week, month, year } = req.query;
    let filter = { userId: req.user._id };

    if (week === 'true') {
      const today = new Date();
      const day = today.getDay();
      const monday = new Date(today);
      monday.setDate(today.getDate() - (day === 0 ? 6 : day - 1));
      const sunday = new Date(monday);
      sunday.setDate(monday.getDate() + 6);
      const monStr = monday.toISOString().split('T')[0];
      const sunStr = sunday.toISOString().split('T')[0];
      filter.date = { $gte: monStr, $lte: sunStr };
    } else if (month && year) {
      const pad = (n) => String(n).padStart(2, '0');
      filter.date = {
        $gte: `${year}-${pad(month)}-01`,
        $lte: `${year}-${pad(month)}-31`,
      };
    }

    const records = await Attendance.find(filter).sort({ date: -1 });
    res.json({ success: true, count: records.length, records });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// GET /api/attendance/all — Admin
const getAllAttendance = async (req, res) => {
  try {
    const { date, userId } = req.query;
    const filter = {};
    if (date) filter.date = date;
    if (userId) filter.userId = userId;

    const records = await Attendance.find(filter)
      .populate('userId', 'employeeId email')
      .sort({ date: -1 });

    res.json({ success: true, count: records.length, records });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// GET /api/attendance/today-summary — Admin
const getTodaySummary = async (req, res) => {
  try {
    const today = getTodayDate();
    const records = await Attendance.find({ date: today });
    const summary = {
      present: records.filter((r) => r.status === 'PRESENT').length,
      absent: records.filter((r) => r.status === 'ABSENT').length,
      halfDay: records.filter((r) => r.status === 'HALF_DAY').length,
      leave: records.filter((r) => r.status === 'LEAVE').length,
    };
    res.json({ success: true, date: today, summary });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

module.exports = { checkIn, checkOut, getMyAttendance, getAllAttendance, getTodaySummary };