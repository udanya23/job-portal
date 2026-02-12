const express = require("express")
const router = express.Router()
const bcrypt = require("bcrypt")
const jwt = require("jsonwebtoken")
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
            subject: "Job Portal - Email Verification",
            html: `
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
                    <h2 style="color: #333; margin-bottom: 20px;">Job Portal - Email Verification</h2>
                    <p style="color: #555; font-size: 16px; margin-bottom: 10px;">Your OTP for registration is:</p>
                    <h1 style="color: #4CAF50; font-size: 48px; font-weight: bold; letter-spacing: 5px; margin: 20px 0;">${otp}</h1>
                    <p style="color: #666; font-size: 14px; margin-top: 20px;">This OTP will expire in <strong>10 minutes</strong>.</p>
                    <p style="color: #666; font-size: 14px;">If you didn't request this, please ignore this email.</p>
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

        console.log("=== VERIFY OTP DEBUG ===")
        console.log("Received email:", email)
        console.log("Received OTP:", otp)
        console.log("Received role:", role)

        if (!email || !otp || !role) {
            return res.status(400).json({ "message": "Email, OTP and role are required" })
        }

        const Model = getModel(role)
        if (!Model) {
            return res.status(400).json({ "message": "Invalid role" })
        }

        console.log("Searching for user with email:", email, "in model:", role)
        const user = await Model.findOne({ email })
        console.log("User found:", user ? "YES" : "NO")

        if (!user) {
            console.log("ERROR: User not found in database")
            return res.status(400).json({ "message": "User not found" })
        }

        console.log("User OTP from DB:", user.verificationOtp)
        console.log("OTP Expires at:", user.otpExpires)
        console.log("Current time:", Date.now())

        // Check OTP validity
        if (user.verificationOtp !== otp || user.otpExpires < Date.now()) {
            console.log("ERROR: Invalid or expired OTP")
            return res.status(400).json({ "message": "Invalid or expired OTP" })
        }

        // Mark as verified
        user.isVerified = true
        await user.save()

        console.log("SUCCESS: User verified successfully")
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

// Login route
router.post("/login", async (req, res) => {
    try {
        const { email, password, role } = req.body

        // Validate input
        if (!email || !password || !role) {
            return res.status(400).json({ message: "Email, password and role are required" })
        }

        const Model = getModel(role)
        if (!Model) {
            return res.status(400).json({ message: "Invalid role" })
        }

        // Find user by email
        const user = await Model.findOne({ email })
        if (!user) {
            return res.status(401).json({ message: "Invalid email or password" })
        }

        // Check if user is verified
        if (!user.isVerified) {
            return res.status(403).json({ message: "Please verify your email first" })
        }

        // Compare password
        const isPasswordValid = await bcrypt.compare(password, user.password)
        if (!isPasswordValid) {
            return res.status(401).json({ message: "Invalid email or password" })
        }

        // Generate JWT token
        const token = jwt.sign(
            {
                id: user._id,
                email: user.email,
                role: role,
                name: user.name
            },
            process.env.JWT_SECRET || "your-secret-key-change-this-in-production",
            { expiresIn: "7d" } // Token expires in 7 days
        )

        // Send response with token and user info
        res.status(200).json({
            message: "Login successful",
            token: token,
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                role: role,
                mobileNumber: user.mobileNumber,
                ...(role === "jobseeker"
                    ? { address: user.address, gender: user.gender }
                    : { companyName: user.companyName, companyAddress: user.companyAddress }
                )
            }
        })

    } catch (err) {
        console.log("Error in login:", err)
        res.status(500).json({ message: "Login failed. Please try again." })
    }
})

// ========== FORGOT PASSWORD FUNCTIONALITY ==========

// Send OTP for password reset
router.post("/forgot-password", async (req, res) => {
    try {
        const { email } = req.body

        if (!email) {
            return res.status(400).json({ message: "Email is required" })
        }

        // Try to find user in both JobSeeker and Recruiter models
        let user = await JobSeeker.findOne({ email })
        let role = "jobseeker"

        if (!user) {
            user = await Recruiter.findOne({ email })
            role = "recruiter"
        }

        if (!user) {
            return res.status(404).json({ message: "Email not found" })
        }

        // Generate 5-digit OTP
        const otp = Math.floor(10000 + Math.random() * 90000).toString()

        // Save OTP and expiry
        user.resetPasswordOtp = otp
        user.resetPasswordExpires = Date.now() + 10 * 60 * 1000 // 10 minutes
        await user.save()

        // Send OTP email
        await transporter.sendMail({
            from: process.env.EMAIL_USER,
            to: email,
            subject: "Job Portal - Password Reset OTP",
            html: `
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
                    <h2 style="color: #333; margin-bottom: 20px;">Password Reset Request</h2>
                    <p style="color: #555; font-size: 16px; margin-bottom: 10px;">Your OTP for password reset is:</p>
                    <h1 style="color: #4CAF50; font-size: 48px; font-weight: bold; letter-spacing: 5px; margin: 20px 0;">${otp}</h1>
                    <p style="color: #666; font-size: 14px; margin-top: 20px;">This OTP will expire in <strong>10 minutes</strong>.</p>
                    <p style="color: #666; font-size: 14px;">If you didn't request this, please ignore this email.</p>
                </div>
            `
        })

        res.status(200).json({
            message: "OTP sent to your email",
            email: email,
            role: role
        })
    } catch (err) {
        console.log("Error in forgot-password:", err)
        res.status(500).json({ message: "Failed to send OTP. Please try again." })
    }
})

// router.post("/forgot-password", async (req, res) => {
//     const { email } = req.body
//     console.log(email)
//     const user = await User.findOne({ email })
//     if (!user)
//         return res.status(400).json({ "message": "user invalid" })
//     const otp = Math.floor(Math.random() * 90000 + 10000)
//     user.resetOtp = otp
//     user.resetOtpExpires = Date.now() + 10*60*1000 //h*min*sec*millisec
//     await user.save()
//     await transporter.sendMail({
//         from: process.env.EMAIL_USER,
//         to: email,
//         subject: "your OTP for password reset",
//         html: `
//         <h2>your otp <b>${otp}</b></h2>
//         <p>this will expires in 10 minutes</p> `
//     })
//     res.status(200).json({"message":"sent otp successfully"})
// })

// Verify reset OTP
router.post("/verify-reset-otp", async (req, res) => {
    try {
        const { email, otp, role } = req.body

        if (!email || !otp || !role) {
            return res.status(400).json({ message: "Email, OTP and role are required" })
        }

        const Model = getModel(role)
        if (!Model) {
            return res.status(400).json({ message: "Invalid role" })
        }

        const user = await Model.findOne({ email })
        if (!user) {
            return res.status(404).json({ message: "User not found" })
        }

        // Check if OTP matches and is not expired
        if (user.resetPasswordOtp !== otp || user.resetPasswordExpires < Date.now()) {
            return res.status(400).json({ message: "Invalid or expired OTP" })
        }

        res.status(200).json({ message: "OTP verified successfully" })
    } catch (err) {
        console.log("Error in verify-reset-otp:", err)
        res.status(500).json({ message: "Verification failed. Please try again." })
    }
})

// Reset password
router.post("/reset-password", async (req, res) => {
    try {
        const { email, otp, newPassword, role } = req.body

        if (!email || !otp || !newPassword || !role) {
            return res.status(400).json({ message: "All fields are required" })
        }

        const Model = getModel(role)
        if (!Model) {
            return res.status(400).json({ message: "Invalid role" })
        }

        const user = await Model.findOne({ email })
        if (!user) {
            return res.status(404).json({ message: "User not found" })
        }

        // Verify OTP again
        if (user.resetPasswordOtp !== otp || user.resetPasswordExpires < Date.now()) {
            return res.status(400).json({ message: "Invalid or expired OTP" })
        }

        // Hash new password
        const hashedPassword = await bcrypt.hash(newPassword, 10)

        // Update password and clear OTP fields
        user.password = hashedPassword
        user.resetPasswordOtp = undefined
        user.resetPasswordExpires = undefined
        await user.save()

        res.status(200).json({ message: "Password reset successful. You can now login with your new password." })
    } catch (err) {
        console.log("Error in reset-password:", err)
        res.status(500).json({ message: "Password reset failed. Please try again." })
    }
})

module.exports = router

