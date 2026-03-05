const express = require("express")
const router = express.Router()
const Application = require("../models/Application")
const Job = require("../models/Job")
const JobSeeker = require("../models/JobSeeker")
const Notification = require("../models/Notification")
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

        // Notify recruiter that someone applied
        const job = await Job.findById(jobId).select("title recruiter")
        const seeker = await JobSeeker.findById(req.user.id).select("name")
        if (job && seeker) {
            await Notification.create({
                recipient: job.recruiter,
                recipientRole: "recruiter",
                message: `${seeker.name} applied for "${job.title}"`,
                link: `/jobs/${jobId}/applicants`
            })
        }

        res.status(201).json(newApplication)
    } catch (err) {
        res.status(500).json({ message: "Failed to apply for job" })
    }
})

// Check if current user has applied for a specific job (JobSeeker only)
router.get("/check/:jobId", authMiddleware, async (req, res) => {
    try {
        if (req.user.role !== "jobseeker") {
            return res.status(200).json({ applied: false })
        }

        const existing = await Application.findOne({
            job: req.params.jobId,
            applicant: req.user.id
        })

        res.status(200).json({ applied: !!existing })
    } catch (err) {
        res.status(500).json({ message: "Failed to check application status" })
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

// Update application status (Recruiter only)
router.patch("/:id/status", authMiddleware, async (req, res) => {
    try {
        if (req.user.role !== "recruiter") {
            return res.status(403).json({ message: "Only recruiters can update application status" })
        }

        const { status } = req.body
        const validStatuses = ["Applied", "Interviewing", "Accepted", "Rejected", "Pending"]
        if (!validStatuses.includes(status)) {
            return res.status(400).json({ message: "Invalid status value" })
        }

        const application = await Application.findById(req.params.id).populate("job")
        if (!application) {
            return res.status(404).json({ message: "Application not found" })
        }

        if (!application.job) {
            return res.status(404).json({ message: "Associated job not found" })
        }

        // Verify this recruiter owns the job — use .equals() for ObjectId comparison
        if (!application.job.recruiter.equals(req.user.id)) {
            return res.status(403).json({ message: "Unauthorized: you don't own this job" })
        }

        application.status = status
        await application.save()

        // Notify job seeker of status update
        await Notification.create({
            recipient: application.applicant,
            recipientRole: "jobseeker",
            message: `Your application for "${application.job.title}" has been updated to: ${status}`,
            link: `/my-applications`
        })

        res.status(200).json(application)
    } catch (err) {
        console.error("Failed to update application status:", err)
        res.status(500).json({ message: "Failed to update application status" })
    }
})

module.exports = router
