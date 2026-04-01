const express = require("express")
const router = express.Router()
const Application = require("../models/Application")
const Job = require("../models/Job")
const JobSeeker = require("../models/JobSeeker")
const Notification = require("../models/Notification")
const authMiddleware = require("../middleware/authMiddleware")
const transporter = require("../utils/sendEmail")

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

// Get Recruiter Analytics (Recruiter only)
router.get("/analytics", authMiddleware, async (req, res) => {
    try {
        if (req.user.role !== "recruiter") {
            return res.status(403).json({ message: "Unauthorized" })
        }

        const myJobs = await Job.find({ recruiter: req.user.id })
        const jobIds = myJobs.map(j => j._id)
        const applications = await Application.find({ job: { $in: jobIds } })

        const totalJobs = myJobs.length
        const totalApplications = applications.length

        const statusBreakdown = { Applied: 0, Interviewing: 0, Accepted: 0, Rejected: 0, Pending: 0 }
        const applicationsByDate = {}
        const applicationsByJob = {}

        applications.forEach(app => {
            if (statusBreakdown[app.status] !== undefined) statusBreakdown[app.status]++
            else statusBreakdown.Pending++

            const dateKey = new Date(app.appliedDate).toISOString().split('T')[0]
            applicationsByDate[dateKey] = (applicationsByDate[dateKey] || 0) + 1

            const jobStr = app.job.toString()
            applicationsByJob[jobStr] = (applicationsByJob[jobStr] || 0) + 1
        })

        const timelineData = Object.entries(applicationsByDate)
            .sort((a, b) => new Date(a[0]) - new Date(b[0]))
            .map(([date, count]) => ({ date, count }))

        const topJobsData = Object.entries(applicationsByJob)
            .map(([jId, count]) => {
                const job = myJobs.find(j => j._id.toString() === jId)
                return { name: job?.title || "Unknown", count }
            })
            .sort((a, b) => b.count - a.count)
            .slice(0, 5)

        res.status(200).json({
            overview: { totalJobs, totalApplications, activeInterviews: statusBreakdown.Interviewing },
            statusBreakdown: Object.entries(statusBreakdown).map(([name, value]) => ({ name, value })),
            timelineData,
            topJobsData
        })
    } catch (err) {
        console.error("Analytics Error:", err)
        res.status(500).json({ message: "Failed to fetch analytics" })
    }
})

// Get ALL applicants across all the recruiter's jobs (Recruiter only)
router.get("/my-jobs", authMiddleware, async (req, res) => {
    try {
        if (req.user.role !== "recruiter") {
            return res.status(403).json({ message: "Unauthorized" })
        }

        // Find all jobs belonging to this recruiter
        const myJobs = await Job.find({ recruiter: req.user.id }).select("_id title location companyName")
        const jobIds = myJobs.map(j => j._id)

        // Fetch all applications for those jobs
        const applications = await Application.find({ job: { $in: jobIds } })
            .populate("applicant", "name email mobileNumber address gender resume resumeOriginalName")
            .populate("job", "title location companyName")
            .sort({ appliedDate: -1 })

        res.status(200).json(applications)
    } catch (err) {
        console.error("Failed to fetch recruiter applicants:", err)
        res.status(500).json({ message: "Failed to fetch applicants" })
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
            .populate("applicant", "name email mobileNumber resume resumeOriginalName")

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

        const { status, interviewDate } = req.body
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

        // ── Idempotency guard ─────────────────────────────────────────────
        // Capture PREVIOUS values before any mutation.
        // If status & interviewDate are unchanged, skip DB write + email.
        const prevStatus   = application.status
        const prevDateMs   = application.interviewDate ? new Date(application.interviewDate).getTime() : null
        const incomingDateMs = interviewDate ? new Date(interviewDate).getTime() : null
        const alreadySameInterview =
            prevStatus === "Interviewing" &&
            status === "Interviewing" &&
            incomingDateMs &&
            prevDateMs &&
            incomingDateMs === prevDateMs

        if (alreadySameInterview) {
            return res.status(200).json(application)
        }
        // ─────────────────────────────────────────────────────────────────

        application.status = status
        if (status === "Interviewing" && interviewDate) {
            application.interviewDate = new Date(interviewDate)
        }
        await application.save()

        // Notify job seeker of status update
        const notifMessage = status === "Interviewing" && interviewDate
            ? `Interview scheduled for your application to "${application.job.title}" on ${new Date(interviewDate).toLocaleString("en-IN", { weekday: "short", day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit" })}`
            : `Your application for "${application.job.title}" has been updated to: ${status}`;

        await Notification.create({
            recipient: application.applicant,
            recipientRole: "jobseeker",
            message: notifMessage,
            link: `/my-applications`
        })

        if (status === "Interviewing" && interviewDate) {
            try {
                const seeker = await JobSeeker.findById(application.applicant)
                if (seeker?.email) {
                    const mailOptions = {
                        from: process.env.EMAIL_USER,
                        to: seeker.email,
                        subject: `Interview Scheduled - ${application.job.title}`,
                        text: `Hello ${seeker.name},\n\nGood news! The recruiter has reviewed your application for "${application.job.title}" and would like to schedule an interview.\n\nScheduled Date & Time: ${new Date(interviewDate).toLocaleString('en-US', { dateStyle: 'full', timeStyle: 'short' })}\n\nBest regards,\nCareerLink Team`
                    }
                    await transporter.sendMail(mailOptions)
                }
            } catch (err) {
                console.error("Failed to send interview email:", err)
            }
        }

        res.status(200).json(application)
    } catch (err) {
        console.error("Failed to update application status:", err)
        res.status(500).json({ message: "Failed to update application status" })
    }
})

module.exports = router
