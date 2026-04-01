const express = require("express")
const router = express.Router()
const bcrypt = require("bcrypt")
const authMiddleware = require("../middleware/authMiddleware");
const jwt = require("jsonwebtoken")
const JobSeeker = require("../models/JobSeeker")
const Recruiter = require("../models/Recruiter")
const transporter = require("../utils/mail")
const { generateAccessToken, generateRefreshToken } = require("../utils/generateTokens")



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

        // Check if a verified account exists in the OPPOSITE role — prevent cross-role conflicts
        const oppositeModel = role === "jobseeker" ? Recruiter : JobSeeker
        const oppositeUser = await oppositeModel.findOne({ email, isVerified: true })
        if (oppositeUser) {
            const oppositeRole = role === "jobseeker" ? "recruiter" : "job seeker"
            return res.status(409).json({ "message": `This email is already registered as a ${oppositeRole}. Please use a different email or log in as ${oppositeRole}.` })
        }

        // Check if user already registered and verified in this role
        const existingUser = await Model.findOne({ email })
        if (existingUser && existingUser.isVerified && existingUser.name !== "temp") {
            return res.status(409).json({ "message": "Email already registered" })
        }

        // Generate 5-digit OTP
        const otp = Math.floor(10000 + Math.random() * 90000).toString()

        // Save or update OTP in database
        if (existingUser) {
            existingUser.verificationOtp = otp
            existingUser.otpExpires = Date.now() + 10 * 60 * 1000 // 10 minutes
            existingUser.isVerified = false // reset verification for re-registration
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
        console.error("Error in verify-otp:", err)
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

// Login route — supports optional `role` for explicit login, otherwise auto-detects
router.post("/login", async (req, res) => {
    try {
        const { email, password, role: requestedRole } = req.body

        if (!email || !password) {
            return res.status(400).json({ message: "Email and password are required" })
        }

        let user = null
        let role = null

        if (requestedRole) {
            // Explicit role requested — look up only that collection
            const Model = getModel(requestedRole)
            if (!Model) {
                return res.status(400).json({ message: "Invalid role specified" })
            }
            user = await Model.findOne({ email, isVerified: true })
            // Skip incomplete temp accounts
            if (user && user.name === "temp") user = null
            role = requestedRole
        } else {
            // Auto-detect: try JobSeeker first, then Recruiter
            // Skip incomplete temp accounts (isVerified=true but registration not completed)
            const jsUser = await JobSeeker.findOne({ email, isVerified: true })
            if (jsUser && jsUser.name !== "temp") {
                user = jsUser
                role = "jobseeker"
            }

            if (!user) {
                const recUser = await Recruiter.findOne({ email, isVerified: true })
                if (recUser && recUser.name !== "temp") {
                    user = recUser
                    role = "recruiter"
                }
            }
        }

        if (!user) {
            return res.status(401).json({ message: "Invalid email or password" })
        }

        // Compare password
        const isPasswordValid = await bcrypt.compare(password, user.password)
        if (!isPasswordValid) {
            return res.status(401).json({ message: "Invalid email or password" })
        }

        // Generate tokens
        const payload = { id: user._id, email: user.email, role, name: user.name }
        const accessToken = generateAccessToken(payload)
        const refreshToken = generateRefreshToken(payload)

        // Save refresh token to DB
        user.refreshToken = refreshToken
        await user.save()

        // Set refresh token as HTTP-only cookie
        res.cookie("refreshToken", refreshToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            path: "/",
            sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
            maxAge: 7 * 24 * 60 * 60 * 1000
        })

        res.status(200).json({
            message: "Login successful",
            token: accessToken,
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                role,
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

// Refresh token — issues a new access token using the HTTP-only cookie
router.post("/refresh-token", async (req, res) => {
    const refreshToken = req.cookies.refreshToken
    if (!refreshToken)
        return res.status(401).json({ message: "No refresh token provided" })
    try {
        const decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET || "your-refresh-secret-key")
        const Model = getModel(decoded.role)
        if (!Model)
            return res.status(401).json({ message: "Invalid token" })
        const user = await Model.findById(decoded.id)
        if (!user || user.refreshToken !== refreshToken)
            return res.status(401).json({ message: "Invalid or revoked refresh token" })
        const newAccessToken = generateAccessToken({
            id: user._id,
            email: user.email,
            role: decoded.role,
            name: user.name
        })
        return res.status(200).json({ token: newAccessToken })
    } catch (err) {
        console.log("Error in refresh-token:", err)
        return res.status(401).json({ message: "Refresh token expired or invalid" })
    }
})

// Logout — clears the refresh token cookie and removes it from DB
router.post("/logout", async (req, res) => {
    const refreshToken = req.cookies.refreshToken
    if (refreshToken) {
        try {
            const decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET || "your-refresh-secret-key")
            const Model = getModel(decoded.role)
            if (Model) {
                const user = await Model.findById(decoded.id)
                if (user) {
                    user.refreshToken = ""
                    await user.save()
                }
            }
        } catch (err) {
            // Token may already be expired — still clear the cookie
            console.log("Logout: could not decode refresh token", err.message)
        }
    }
    res.clearCookie("refreshToken", { 
        httpOnly: true, 
        path: "/",
        secure: process.env.NODE_ENV === "production",
        sameSite: process.env.NODE_ENV === "production" ? "none" : "lax"
    })
    return res.status(200).json({ message: "Logged out successfully" })
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

// ================= PROFILE ROUTES =================

// Get Logged-in User Profile
router.get("/profile", authMiddleware, async (req, res) => {
    try {
        const { id, role } = req.user;

        const Model = getModel(role);
        if (!Model) {
            return res.status(400).json({ message: "Invalid role" });
        }

        const user = await Model.findById(id).select("-password");

        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        res.status(200).json({ ...user.toObject(), role });

    } catch (err) {
        console.log("Error in get profile:", err);
        res.status(500).json({ message: "Failed to fetch profile" });
    }
});

// Update Logged-in User Profile
router.put("/profile", authMiddleware, async (req, res) => {
    try {
        const { id, role } = req.user;

        const Model = getModel(role);
        if (!Model) {
            return res.status(400).json({ message: "Invalid role" });
        }

        const updatedUser = await Model.findByIdAndUpdate(
            id,
            req.body,
            { new: true }
        ).select("-password");

        res.status(200).json({ ...updatedUser.toObject(), role });

    } catch (err) {
        console.log("Error in update profile:", err);
        res.status(500).json({ message: "Profile update failed" });
    }
});


// ================= MULTER CONFIGURATION =================
const multer = require("multer");
const path = require("path");
const fs = require("fs");

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        let dest = "uploads/";
        if (file.fieldname === "profilePhoto") {
            dest += "profilePhotos/";
        } else if (file.fieldname === "resume") {
            dest += "resumes/";
        }
        cb(null, dest);
    },
    filename: function (req, file, cb) {
        const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
        cb(null, file.fieldname + "-" + uniqueSuffix + path.extname(file.originalname));
    }
});

const fileFilter = (req, file, cb) => {
    if (file.fieldname === "profilePhoto") {
        if (file.mimetype.startsWith("image/")) {
            cb(null, true);
        } else {
            cb(new Error("Only images are allowed for profile photo!"), false);
        }
    } else if (file.fieldname === "resume") {
        if (file.mimetype === "application/pdf") {
            cb(null, true);
        } else {
            cb(new Error("Only PDF files are allowed for resume!"), false);
        }
    } else {
        cb(null, true);
    }
};

const upload = multer({
    storage: storage,
    fileFilter: fileFilter,
    limits: { fileSize: 5 * 1024 * 1024 } // 5MB limit
});

// Update Logged-in User Profile with Files
router.put("/profile-full", authMiddleware, upload.fields([
    { name: "profilePhoto", maxCount: 1 },
    { name: "resume", maxCount: 1 }
]), async (req, res) => {
    try {
        const { id, role } = req.user;
        const Model = getModel(role);

        if (!Model) {
            return res.status(400).json({ message: "Invalid role" });
        }

        let updateData = { ...req.body };

        // Parse JSON strings for arrays/objects if they come from FormData
        if (typeof updateData.skills === 'string') {
            try { updateData.skills = JSON.parse(updateData.skills); } catch (e) { }
        }
        if (typeof updateData.education === 'string') {
            try { updateData.education = JSON.parse(updateData.education); } catch (e) { }
        }
        if (typeof updateData.experience === 'string') {
            try { updateData.experience = JSON.parse(updateData.experience); } catch (e) { }
        }

        // Add file paths to update data
        if (req.files) {
            if (req.files.profilePhoto) {
                updateData.profilePhoto = `/uploads/profilePhotos/${req.files.profilePhoto[0].filename}`;
            }
            if (req.files.resume) {
                updateData.resume = `/uploads/resumes/${req.files.resume[0].filename}`;
                updateData.resumeOriginalName = req.files.resume[0].originalname;
                updateData.resumeUploadedAt = new Date();
            }
        }

        const updatedUser = await Model.findByIdAndUpdate(
            id,
            updateData,
            { new: true }
        ).select("-password");

        res.status(200).json({ ...updatedUser.toObject(), role });
    } catch (err) {
        console.log("Error in update profile with files:", err);
        res.status(500).json({ message: err.message || "Profile update failed" });
    }
});


module.exports = router

