const express = require("express")
const router = express.Router()
const bcrypt = require("bcrypt")
const JobSeeker = require("../models/JobSeeker")
const transporter = require("../utils/mail")

// Send OTP to email
router.post("/send-otp", async (req, res) => {
    try {
        const { email } = req.body

        if (!email) {
            return res.status(400).json({ "message": "Email is required" })
        }

        // Check if user already registered
        const existingUser = await JobSeeker.findOne({ email })
        if (existingUser && existingUser.isVerified) {
            return res.status(409).json({ "message": "Email already registered" })
        }

        // Generate 5-digit OTP
        const otp = Math.floor(10000 + Math.random() * 90000).toString()

        // Save or update OTP in database
        if (existingUser) {
            existingUser.verificationOtp = otp
            existingUser.otpExpires = Date.now() + 10 * 60 * 1000 // 10 minutes
            await existingUser.save()
        } else {
            const tempUser = new JobSeeker({
                email,
                verificationOtp: otp,
                otpExpires: Date.now() + 10 * 60 * 1000,
                // Temporary placeholder values (will be replaced during registration)
                name: "temp",
                password: "temp",
                mobileNumber: "temp",
                address: "temp",
                gender: "Other"
            })
            await tempUser.save()
        }

        // Send OTP email
        await transporter.sendMail({
            from: process.env.EMAIL_USER,
            to: email,
            subject: "Your OTP for Job Portal Registration",
            html: `
                <div style="font-family: Arial, sans-serif; padding: 20px; background-color: #f4f4f4;">
                    <div style="max-width: 600px; margin: 0 auto; background-color: white; padding: 30px; border-radius: 10px;">
                        <h2 style="color: #333;">Job Portal - Email Verification</h2>
                        <p style="font-size: 16px; color: #555;">Your OTP for registration is:</p>
                        <h1 style="color: #4CAF50; font-size: 36px; letter-spacing: 5px;">${otp}</h1>
                        <p style="color: #777;">This OTP will expire in <strong>10 minutes</strong>.</p>
                        <p style="color: #777;">If you didn't request this, please ignore this email.</p>
                    </div>
                </div>
            `
        })

        res.status(200).json({ "message": "OTP sent successfully to your email" })
    } catch (err) {
        console.log("Error in send-otp:", err)
        res.status(500).json({ "message": "Failed to send OTP. Please try again." })
    }
})

// Verify OTP
router.post("/verify-otp", async (req, res) => {
    try {
        const { email, otp } = req.body

        if (!email || !otp) {
            return res.status(400).json({ "message": "Email and OTP are required" })
        }

        const user = await JobSeeker.findOne({ email })
        if (!user) {
            return res.status(400).json({ "message": "User not found" })
        }

        // Check OTP validity
        if (user.verificationOtp !== otp || user.otpExpires < Date.now()) {
            return res.status(400).json({ "message": "Invalid or expired OTP" })
        }

        // Mark as verified
        user.isVerified = true
        await user.save()

        res.status(200).json({ "message": "OTP verified successfully" })
    } catch (err) {
        console.log("Error in verify-otp:", err)
        res.status(500).json({ "message": "Verification failed. Please try again." })
    }
})

// Register job seeker
router.post("/register", async (req, res) => {
    try {
        const { name, email, password, mobileNumber, address, gender } = req.body

        // Validate required fields
        if (!name || !email || !password || !mobileNumber || !address || !gender) {
            return res.status(400).json({ "message": "All fields are required" })
        }

        // Check if user exists and is verified
        const user = await JobSeeker.findOne({ email })
        if (!user) {
            return res.status(400).json({ "message": "Please verify your email first" })
        }

        if (!user.isVerified) {
            return res.status(400).json({ "message": "Please verify your email with OTP first" })
        }

        // Hash password
        const hashedPassword = await bcrypt.hash(password, 10)

        // Update user with complete information
        user.name = name
        user.password = hashedPassword
        user.mobileNumber = mobileNumber
        user.address = address
        user.gender = gender
        user.verificationOtp = undefined
        user.otpExpires = undefined
        await user.save()

        res.status(201).json({ "message": "Registration successful" })
    } catch (err) {
        console.log("Error in register:", err)
        res.status(500).json({ "message": "Registration failed. Please try again." })
    }
})

module.exports = router
