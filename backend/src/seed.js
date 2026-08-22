require('dotenv').config();
const mongoose = require('mongoose');
const User = require('./models/User');
const EmployeeProfile = require('./models/EmployeeProfile');
const Attendance = require('./models/Attendance');
const LeaveRequest = require('./models/LeaveRequest');
const SalaryStructure = require('./models/SalaryStructure');
const PayrollRecord = require('./models/PayrollRecord');
const Notification = require('./models/Notification');

async function seed() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to MongoDB for Indian Localization Seeding...');

    // Clear existing data
    await Promise.all([
      User.deleteMany({}),
      EmployeeProfile.deleteMany({}),
      Attendance.deleteMany({}),
      LeaveRequest.deleteMany({}),
      SalaryStructure.deleteMany({}),
      PayrollRecord.deleteMany({}),
      Notification.deleteMany({}),
    ]);
    console.log('Cleared existing collections.');

    // 1. Create Admin (Priya Sharma)
    const admin = await User.create({
      employeeId: 'ADM001',
      email: 'admin@dayflow.com',
      passwordHash: 'Admin@123',
      role: 'ADMIN',
      isVerified: true,
    });

    await EmployeeProfile.create({
      userId: admin._id,
      firstName: 'Priya',
      lastName: 'Sharma',
      dateOfBirth: new Date('1990-06-18'),
      phoneNumber: '+91 98765 43210',
      address: 'Plot 42, 100ft Road, Indiranagar, Bengaluru, Karnataka 560038',
      department: 'Human Resources',
      designation: 'Head of Human Resources',
      employmentType: 'FULL_TIME',
      joiningDate: new Date('2021-02-01'),
    });

    // 2. Create Employee 1 (Aarav Patel)
    const emp1 = await User.create({
      employeeId: 'EMP001',
      email: 'aarav.patel@dayflow.com',
      passwordHash: 'Employee@123',
      role: 'EMPLOYEE',
      isVerified: true,
    });

    await EmployeeProfile.create({
      userId: emp1._id,
      firstName: 'Aarav',
      lastName: 'Patel',
      dateOfBirth: new Date('1994-08-15'),
      phoneNumber: '+91 98230 11223',
      address: 'Flat 402, Green Glen Layout, Bellandur, Bengaluru, Karnataka 560103',
      department: 'Engineering',
      designation: 'Senior Full Stack Developer',
      employmentType: 'FULL_TIME',
      joiningDate: new Date('2022-04-10'),
    });

    // 3. Create Employee 2 (Ananya Iyer)
    const emp2 = await User.create({
      employeeId: 'EMP002',
      email: 'ananya.iyer@dayflow.com',
      passwordHash: 'Employee@123',
      role: 'EMPLOYEE',
      isVerified: true,
    });

    await EmployeeProfile.create({
      userId: emp2._id,
      firstName: 'Ananya',
      lastName: 'Iyer',
      dateOfBirth: new Date('1996-12-04'),
      phoneNumber: '+91 97112 33445',
      address: '14th Floor, Sea View Towers, Bandra West, Mumbai, Maharashtra 400050',
      department: 'Product & Design',
      designation: 'Lead UI/UX Designer',
      employmentType: 'FULL_TIME',
      joiningDate: new Date('2023-01-15'),
    });

    // 4. Create Employee 3 (Rohan Verma)
    const emp3 = await User.create({
      employeeId: 'EMP003',
      email: 'rohan.verma@dayflow.com',
      passwordHash: 'Employee@123',
      role: 'EMPLOYEE',
      isVerified: true,
    });

    await EmployeeProfile.create({
      userId: emp3._id,
      firstName: 'Rohan',
      lastName: 'Verma',
      dateOfBirth: new Date('1993-03-22'),
      phoneNumber: '+91 99554 66778',
      address: 'Tower B-3, DLF Phase 5, Golf Course Road, Gurugram, Haryana 122009',
      department: 'Infrastructure & Cloud',
      designation: 'DevOps & Cloud Architect',
      employmentType: 'FULL_TIME',
      joiningDate: new Date('2022-09-01'),
    });

    // 5. Create Salary Structures (Indian Rupees - INR / ₹)
    const sal1 = await SalaryStructure.create({
      userId: emp1._id,
      basicSalary: 85000,
      allowances: {
        house: 34000,
        transport: 8000,
        medical: 6000,
        other: 5000,
      },
      deductions: 13000, // PF, Professional Tax, TDS
      currency: 'INR',
      updatedBy: admin._id,
    });

    const sal2 = await SalaryStructure.create({
      userId: emp2._id,
      basicSalary: 75000,
      allowances: {
        house: 30000,
        transport: 6000,
        medical: 5000,
        other: 4000,
      },
      deductions: 11000,
      currency: 'INR',
      updatedBy: admin._id,
    });

    const sal3 = await SalaryStructure.create({
      userId: emp3._id,
      basicSalary: 80000,
      allowances: {
        house: 32000,
        transport: 7000,
        medical: 5000,
        other: 4000,
      },
      deductions: 12000,
      currency: 'INR',
      updatedBy: admin._id,
    });

    // 6. Create Attendance for Today & This Week
    const today = new Date().toISOString().split('T')[0];
    await Attendance.create([
      {
        userId: emp1._id,
        date: today,
        checkIn: '09:15:00',
        checkOut: null,
        status: 'PRESENT',
        workHours: 0,
      },
      {
        userId: emp2._id,
        date: today,
        checkIn: '08:50:30',
        checkOut: '17:30:00',
        status: 'PRESENT',
        workHours: 8.65,
      },
      {
        userId: emp3._id,
        date: today,
        checkIn: '09:05:00',
        checkOut: null,
        status: 'PRESENT',
        workHours: 0,
      },
      {
        userId: admin._id,
        date: today,
        checkIn: '08:40:00',
        checkOut: null,
        status: 'PRESENT',
        workHours: 0,
      },
    ]);

    // 7. Create Leave Requests
    await LeaveRequest.create([
      {
        employeeId: emp1._id,
        leaveType: 'PAID',
        startDate: new Date('2026-10-15'),
        endDate: new Date('2026-10-20'),
        durationDays: 6,
        reason: 'Diwali festive holidays with family in Jaipur.',
        status: 'PENDING',
      },
      {
        employeeId: emp2._id,
        leaveType: 'SICK',
        startDate: new Date('2026-08-11'),
        endDate: new Date('2026-08-12'),
        durationDays: 2,
        reason: 'Viral fever and doctor-prescribed rest.',
        status: 'APPROVED',
        reviewedBy: admin._id,
        hrComments: 'Approved. Take care and get well soon!',
        reviewedAt: new Date('2026-08-10'),
      },
      {
        employeeId: emp3._id,
        leaveType: 'PAID',
        startDate: new Date('2026-09-05'),
        endDate: new Date('2026-09-08'),
        durationDays: 4,
        reason: 'Attending tech conference in Hyderabad.',
        status: 'APPROVED',
        reviewedBy: admin._id,
        hrComments: 'Approved under learning & development allowance.',
        reviewedAt: new Date('2026-08-20'),
      },
    ]);

    // 8. Create Historical Monthly Payslips
    await PayrollRecord.create([
      {
        userId: emp1._id,
        salaryId: sal1._id,
        month: 7,
        year: 2026,
        grossPay: 138000,
        totalDeductions: 13000,
        netPay: 125000,
        status: 'PAID',
        processedBy: admin._id,
        processedAt: new Date('2026-07-31'),
      },
      {
        userId: emp2._id,
        salaryId: sal2._id,
        month: 7,
        year: 2026,
        grossPay: 120000,
        totalDeductions: 11000,
        netPay: 109000,
        status: 'PAID',
        processedBy: admin._id,
        processedAt: new Date('2026-07-31'),
      },
      {
        userId: emp3._id,
        salaryId: sal3._id,
        month: 7,
        year: 2026,
        grossPay: 128000,
        totalDeductions: 12000,
        netPay: 116000,
        status: 'PAID',
        processedBy: admin._id,
        processedAt: new Date('2026-07-31'),
      },
    ]);

    // 9. Create Notifications
    await Notification.create([
      {
        recipientId: emp1._id,
        title: 'Welcome to Dayflow HRMS India',
        message: 'Your Dayflow profile is active. You can log attendance, apply for leaves, and view your monthly salary slips in INR.',
        type: 'SYSTEM',
      },
      {
        recipientId: admin._id,
        title: 'New Leave Application Received',
        message: 'Aarav Patel applied for 6-day Diwali PAID leave awaiting review.',
        type: 'LEAVE',
      },
    ]);

    console.log('\n======================================================');
    console.log('✅ Dayflow HRMS Seeded with Indian Localization (INR):');
    console.log('======================================================');
    console.log('👑 Admin (HR Head):');
    console.log('   Name:     Priya Sharma');
    console.log('   Email:    admin@dayflow.com');
    console.log('   Password: Admin@123');
    console.log('   Location: Indiranagar, Bengaluru, Karnataka');
    console.log('   Emp ID:   ADM001');
    console.log('\n👤 Employee 1:');
    console.log('   Name:     Aarav Patel');
    console.log('   Email:    aarav.patel@dayflow.com');
    console.log('   Password: Employee@123');
    console.log('   Location: Bellandur, Bengaluru, Karnataka');
    console.log('   Emp ID:   EMP001');
    console.log('\n👤 Employee 2:');
    console.log('   Name:     Ananya Iyer');
    console.log('   Email:    ananya.iyer@dayflow.com');
    console.log('   Password: Employee@123');
    console.log('   Location: Bandra West, Mumbai, Maharashtra');
    console.log('   Emp ID:   EMP002');
    console.log('\n👤 Employee 3:');
    console.log('   Name:     Rohan Verma');
    console.log('   Email:    rohan.verma@dayflow.com');
    console.log('   Password: Employee@123');
    console.log('   Location: DLF Phase 5, Gurugram, Haryana');
    console.log('   Emp ID:   EMP003');
    console.log('======================================================\n');

    process.exit(0);
  } catch (err) {
    console.error('❌ Seeding error:', err);
    process.exit(1);
  }
}

seed();
