const express = require("express")
const router = express.Router()
const bcrypt = require("bcrypt")
const JobSeeker = require("../models/JobSeeker")
const Recruiter = require("../models/Recruiter")
const transporter = require("../utils/mail")

// Helper function to get the appropriate model based on role
const getModel = (role) => {
    if (role === "jobseeker") return JobSeeker
    if (role === "recruiter") return Recruiter
    return null
}

// Send OTP to email
router.post("/send-otp", async (req, res) => {
    try {
        const { email, role } = req.body

        if (!email || !role) {
            return res.status(400).json({ "message": "Email and role are required" })
        }

        const Model = getModel(role)
        if (!Model) {
            return res.status(400).json({ "message": "Invalid role" })
        }

        // Check if user already registered
        const existingUser = await Model.findOne({ email })
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
            const tempUser = new Model({
                email,
                verificationOtp: otp,
                otpExpires: Date.now() + 10 * 60 * 1000,
                // Temporary placeholder values
                name: "temp",
                password: "temp",
                mobileNumber: "temp",
                ...(role === "jobseeker"
                    ? { address: "temp", gender: "Other" }
                    : { companyName: "temp", companyAddress: "temp" }
                )
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
        const { email, otp, role } = req.body

        if (!email || !otp || !role) {
            return res.status(400).json({ "message": "Email, OTP and role are required" })
        }

        const Model = getModel(role)
        if (!Model) {
            return res.status(400).json({ "message": "Invalid role" })
        }

        const user = await Model.findOne({ email })
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

// Register user
router.post("/register", async (req, res) => {
    try {
        const { email, password, role, name, mobileNumber } = req.body

        // Validate required fields
        if (!email || !password || !role || !name || !mobileNumber) {
            return res.status(400).json({ "message": "All fields are required" })
        }

        const Model = getModel(role)
        if (!Model) {
            return res.status(400).json({ "message": "Invalid role" })
        }

        // Check if user exists and is verified
        const user = await Model.findOne({ email })
        if (!user) {
            return res.status(400).json({ "message": "Please verify your email first" })
        }

        if (!user.isVerified) {
            return res.status(400).json({ "message": "Please verify your email with OTP first" })
        }

        // Validate role-specific fields
        if (role === "jobseeker") {
            const { address, gender } = req.body
            if (!address || !gender) {
                return res.status(400).json({ "message": "Address and gender are required" })
            }
            user.address = address
            user.gender = gender
        } else if (role === "recruiter") {
            const { companyName, companyAddress } = req.body
            if (!companyName || !companyAddress) {
                return res.status(400).json({ "message": "Company name and address are required" })
            }
            user.companyName = companyName
            user.companyAddress = companyAddress
        }

        // Hash password
        const hashedPassword = await bcrypt.hash(password, 10)

        // Update user with complete information
        user.name = name
        user.password = hashedPassword
        user.mobileNumber = mobileNumber
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
