const jwt = require('jsonwebtoken');
const User = require('../models/User');
const EmployeeProfile = require('../models/EmployeeProfile');
const Notification = require('../models/Notification');

const signToken = (id) =>
    jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRES_IN });

// POST /api/auth/register
const register = async (req, res) => {
    try {
        const { employeeId, email, password, role, firstName, lastName } = req.body;

        const existingUser = await User.findOne({ $or: [{ email }, { employeeId }] });
        if (existingUser) {
            return res.status(400).json({
                success: false,
                message:
                    existingUser.email === email
                        ? 'Email already registered'
                        : 'Employee ID already exists',
            });
        }

        const user = await User.create({
            employeeId,
            email,
            passwordHash: password,
            role: role || 'EMPLOYEE',
        });

        // Create employee profile
        await EmployeeProfile.create({
            userId: user._id,
            firstName: firstName || 'New',
            lastName: lastName || 'Employee',
        });

        // Console log verification link
        console.log(
            `\n📧 Verification link for ${email}: http://localhost:5000/api/auth/verify/${user.verificationToken}\n`
        );

        res.status(201).json({
            success: true,
            message: 'Registration successful. Check the server console for your verification link.',
            verificationToken: user.verificationToken, // returned for dev convenience
        });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

// GET /api/auth/verify/:token
const verifyEmail = async (req, res) => {
    try {
        const user = await User.findOne({ verificationToken: req.params.token });
        if (!user) {
            return res.status(400).json({ success: false, message: 'Invalid or expired verification token' });
        }
        user.isVerified = true;
        user.verificationToken = undefined;
        await user.save({ validateBeforeSave: false });

        res.json({ success: true, message: 'Email verified successfully. You can now log in.' });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

// POST /api/auth/login
const login = async (req, res) => {
    try {
        const { email, password } = req.body;
        if (!email || !password) {
            return res.status(400).json({ success: false, message: 'Email and password are required' });
        }

        const user = await User.findOne({ email }).select('+passwordHash');
        if (!user || !(await user.comparePassword(password))) {
            return res.status(401).json({ success: false, message: 'Invalid email or password' });
        }

        if (!user.isVerified) {
            return res.status(403).json({ success: false, message: 'Please verify your email before logging in' });
        }

        const profile = await EmployeeProfile.findOne({ userId: user._id });
        const token = signToken(user._id);

        res.json({
            success: true,
            token,
            user: {
                id: user._id,
                employeeId: user.employeeId,
                email: user.email,
                role: user.role,
                isVerified: user.isVerified,
                firstName: profile?.firstName || '',
                lastName: profile?.lastName || '',
                profilePicture: profile?.profilePicture || '',
            },
        });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

// GET /api/auth/me
const getMe = async (req, res) => {
    const profile = await EmployeeProfile.findOne({ userId: req.user._id });
    res.json({ success: true, user: req.user, profile });
};

module.exports = { register, verifyEmail, login, getMe };