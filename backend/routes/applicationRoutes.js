const express = require("express")
const router = express.Router()
const Application = require("../models/Application")
const Job = require("../models/Job")
const authMiddleware = require("../middleware/authMiddleware")

// Apply for a job (JobSeeker only)
router.post("/apply", authMiddleware, async (req, res) => {
    try {
        if (req.user.role !== "jobseeker") {
            return res.status(403).json({ message: "Only job seekers can apply for jobs" })
        }

        const { jobId } = req.body

        // Check if already applied
        const existingApplication = await Application.findOne({
            job: jobId,
            applicant: req.user.id
        })

        if (existingApplication) {
            return res.status(400).json({ message: "You have already applied for this job" })
        }

        const newApplication = new Application({
            job: jobId,
            applicant: req.user.id
        })

        await newApplication.save()
        res.status(201).json(newApplication)
    } catch (err) {
        res.status(500).json({ message: "Failed to apply for job" })
    }
})

// Get my applications (JobSeeker only)
router.get("/my-applications", authMiddleware, async (req, res) => {
    try {
        if (req.user.role !== "jobseeker") {
            return res.status(403).json({ message: "Unauthorized" })
        }

        const applications = await Application.find({ applicant: req.user.id })
            .populate("job")
            .sort({ appliedDate: -1 })

        res.status(200).json(applications)
    } catch (err) {
        res.status(500).json({ message: "Failed to fetch applications" })
    }
})

// Get applicants for a job (Recruiter only)
router.get("/job/:jobId", authMiddleware, async (req, res) => {
    try {
        if (req.user.role !== "recruiter") {
            return res.status(403).json({ message: "Unauthorized" })
        }

        // Verify the recruiter owns the job
        const job = await Job.findById(req.params.jobId)
        if (!job || job.recruiter.toString() !== req.user.id) {
            return res.status(403).json({ message: "Unauthorized" })
        }

        const applications = await Application.find({ job: req.params.jobId })
            .populate("applicant", "name email mobileNumber")

        res.status(200).json(applications)
    } catch (err) {
        res.status(500).json({ message: "Failed to fetch applicants" })
    }
})

module.exports = router
