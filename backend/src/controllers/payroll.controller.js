const SalaryStructure = require('../models/SalaryStructure');
const PayrollRecord = require('../models/PayrollRecord');
const Notification = require('../models/Notification');

// GET /api/payroll/my-salary
const getMySalary = async (req, res) => {
  try {
    const salary = await SalaryStructure.findOne({ userId: req.user._id });
    if (!salary) return res.status(404).json({ success: false, message: 'No salary structure found' });
    res.json({ success: true, salary });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// GET /api/payroll/my-records
const getMyPayrollRecords = async (req, res) => {
  try {
    const records = await PayrollRecord.find({ userId: req.user._id })
      .populate('salaryId')
      .sort({ year: -1, month: -1 });
    res.json({ success: true, count: records.length, records });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// GET /api/payroll/all — Admin
const getAllSalaries = async (req, res) => {
  try {
    const salaries = await SalaryStructure.find()
      .populate('userId', 'employeeId email')
      .populate('updatedBy', 'employeeId')
      .sort({ updatedAt: -1 });
    res.json({ success: true, count: salaries.length, salaries });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// PUT /api/payroll/salary/:userId — Admin upsert salary structure
const upsertSalary = async (req, res) => {
  try {
    const { basicSalary, allowances, deductions, currency, effectiveFrom } = req.body;
    let salary = await SalaryStructure.findOne({ userId: req.params.userId });

    if (salary) {
      salary.basicSalary = basicSalary ?? salary.basicSalary;
      salary.allowances = { ...salary.allowances.toObject(), ...(allowances || {}) };
      salary.deductions = deductions ?? salary.deductions;
      salary.currency = currency ?? salary.currency;
      salary.effectiveFrom = effectiveFrom ?? salary.effectiveFrom;
      salary.updatedBy = req.user._id;
      await salary.save();
    } else {
      salary = await SalaryStructure.create({
        userId: req.params.userId,
        basicSalary,
        allowances,
        deductions,
        currency,
        effectiveFrom,
        updatedBy: req.user._id,
      });
    }

    // Notify employee
    await Notification.create({
      recipientId: req.params.userId,
      title: 'Salary Structure Updated',
      message: `Your salary structure has been updated. New net salary: ${salary.currency} ${salary.netSalary.toLocaleString()}`,
      type: 'PAYROLL',
    });

    res.json({ success: true, message: 'Salary structure updated', salary });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// POST /api/payroll/process/:userId — Admin process monthly payroll
const processPayroll = async (req, res) => {
  try {
    const { month, year } = req.body;
    const salary = await SalaryStructure.findOne({ userId: req.params.userId });
    if (!salary) return res.status(404).json({ success: false, message: 'No salary structure found for employee' });

    const totalAllowances =
      salary.allowances.house +
      salary.allowances.transport +
      salary.allowances.medical +
      salary.allowances.other;

    const record = await PayrollRecord.findOneAndUpdate(
      { userId: req.params.userId, month, year },
      {
        salaryId: salary._id,
        grossPay: salary.basicSalary + totalAllowances,
        totalDeductions: salary.deductions,
        netPay: salary.netSalary,
        status: 'PROCESSED',
        processedBy: req.user._id,
        processedAt: new Date(),
      },
      { upsert: true, new: true }
    );

    await Notification.create({
      recipientId: req.params.userId,
      title: 'Payroll Processed',
      message: `Your payroll for ${month}/${year} has been processed. Net Pay: ${salary.currency} ${salary.netSalary.toLocaleString()}`,
      type: 'PAYROLL',
    });

    res.json({ success: true, message: 'Payroll processed', record });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// GET /api/payroll/all-records — Admin
const getAllPayrollRecords = async (req, res) => {
  try {
    const { month, year } = req.query;
    const filter = {};
    if (month) filter.month = Number(month);
    if (year) filter.year = Number(year);
    const records = await PayrollRecord.find(filter)
      .populate('userId', 'employeeId email')
      .sort({ year: -1, month: -1 });
    res.json({ success: true, count: records.length, records });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

module.exports = { getMySalary, getMyPayrollRecords, getAllSalaries, upsertSalary, processPayroll, getAllPayrollRecords };
