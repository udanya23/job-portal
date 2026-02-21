const express = require("express")
const router = express.Router()
const Job = require("../models/Job")
const authMiddleware = require("../middleware/authMiddleware")

// Get all jobs
router.get("/", async (req, res) => {
    try {
        const jobs = await Job.find().populate("recruiter", "name companyName")
        res.status(200).json(jobs)
    } catch (err) {
        res.status(500).json({ message: "Failed to fetch jobs" })
    }
})

// Get single job
router.get("/:id", async (req, res) => {
    try {
        const job = await Job.findById(req.params.id).populate("recruiter", "name companyName companyAddress")
        if (!job) return res.status(404).json({ message: "Job not found" })
        res.status(200).json(job)
    } catch (err) {
        res.status(500).json({ message: "Failed to fetch job details" })
    }
})

// Create job (Recruiter only)
router.post("/", authMiddleware, async (req, res) => {
    try {
        if (req.user.role !== "recruiter") {
            return res.status(403).json({ message: "Only recruiters can post jobs" })
        }

        const { title, description, companyName, location, salary, requirements } = req.body
        const newJob = new Job({
            title,
            description,
            companyName,
            location,
            salary,
            requirements,
            recruiter: req.user.id
        })

        await newJob.save()
        res.status(201).json(newJob)
    } catch (err) {
        res.status(500).json({ message: "Failed to create job" })
    }
})

module.exports = router
