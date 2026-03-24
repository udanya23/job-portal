const express = require("express")
const router = express.Router()
const authMiddleware = require("../middleware/authMiddleware")

const multerUpload = require("../middleware/upload")
const JobSeeker = require("../models/JobSeeker")
const Recruiter = require("../models/Recruiter")

const getModel = (role) => {
    return role === "jobseeker" ? JobSeeker : role === "recruiter" ? Recruiter : null
}

// GET profile
router.get("/profile", authMiddleware, async (req, res) => {
    try {
        const Model = getModel(req.user.role)
        if (!Model) return res.status(400).json({ message: "Invalid role" })

        const user = await Model.findById(req.user.id).select("-password")
        if (!user) return res.status(404).json({ message: "User not found" })

        res.status(200).json(user)
    } catch (err) {
        res.status(500).json({ message: "Server error", error: err.message })
    }
})

// PUT profile
router.put("/profile", authMiddleware, multerUpload.fields([{ name: "profilePhoto", maxCount: 1 }, { name: "resume", maxCount: 1 }]), async (req, res) => {
    try {
        const Model = getModel(req.user.role)
        if (!Model) return res.status(400).json({ message: "Invalid role" })

        let user = await Model.findById(req.user.id)
        if (!user) return res.status(404).json({ message: "User not found" })

        // Update fields based on role
        const updates = req.body

        // For arrays like 'skills', handle comma-separated string if sent via FormData
        if (updates.skills && typeof updates.skills === "string") {
            updates.skills = updates.skills.split(",").map(s => s.trim()).filter(s => s)
        }

        Object.keys(updates).forEach(key => {
            if (user[key] !== undefined && key !== "password" && key !== "email" && key !== "isVerified" && key !== "role") {
                user[key] = updates[key]
            }
        })

        // Handle uploaded files
        if (req.files && req.files["profilePhoto"]) {
            user.profilePhoto = `/uploads/${req.files["profilePhoto"][0].filename}`
        }

        if (req.files && req.files["resume"]) {
            user.resume = `/uploads/${req.files["resume"][0].filename}`
            user.resumeOriginalName = req.files["resume"][0].originalname
            user.resumeUploadedAt = new Date()
        }

        await user.save()
        res.status(200).json({ message: "Profile updated successfully", user })
    } catch (err) {
        console.error("Profile update error:", err)
        res.status(500).json({ message: "Server error during update", error: err.message })
    }
})

module.exports = router
