const express = require("express")
const router = express.Router()
const Job = require("../models/Job")
const JobSeeker = require("../models/JobSeeker")
const Notification = require("../models/Notification")
const authMiddleware = require("../middleware/authMiddleware")
const transporter = require("../utils/sendEmail")

// ── helpers ─────────────────────────────────────────────────────────────────

const jobAlertHtml = (seeker, job, jobUrl) => `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
  <title>New Job Alert – CareerLink</title>
</head>
<body style="margin:0;padding:0;background:#f1f5f9;font-family:'Segoe UI',Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f1f5f9;padding:40px 16px;">
    <tr><td align="center">
      <table width="600" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:16px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,0.07);">
        <!-- Header -->
        <tr>
          <td style="background:linear-gradient(135deg,#4f46e5,#7c3aed);padding:40px 40px 30px;text-align:center;">
            <h1 style="margin:0;color:#ffffff;font-size:22px;font-weight:700;letter-spacing:-0.5px;">CareerLink</h1>
            <p style="margin:8px 0 0;color:rgba(255,255,255,0.8);font-size:13px;">Your next opportunity just arrived</p>
          </td>
        </tr>
        <!-- Body -->
        <tr>
          <td style="padding:40px;">
            <p style="margin:0 0 8px;font-size:14px;color:#64748b;font-weight:600;">Hello, ${seeker.name} 👋</p>
            <p style="margin:0 0 28px;font-size:15px;color:#334155;line-height:1.6;">
              A new job matching your skills has just been posted on CareerLink. Here are the details:
            </p>
            <!-- Job Card -->
            <table width="100%" cellpadding="0" cellspacing="0" style="background:#f8fafc;border:1px solid #e2e8f0;border-radius:12px;overflow:hidden;margin-bottom:28px;">
              <tr>
                <td style="background:linear-gradient(135deg,#4f46e5,#7c3aed);padding:20px 24px;">
                  <h2 style="margin:0;color:#ffffff;font-size:20px;font-weight:700;">${job.title}</h2>
                  <p style="margin:6px 0 0;color:rgba(255,255,255,0.85);font-size:14px;font-weight:500;">${job.companyName}</p>
                </td>
              </tr>
              <tr>
                <td style="padding:24px;">
                  <table width="100%" cellpadding="0" cellspacing="0">
                    <tr>
                      <td width="50%" style="padding-bottom:16px;">
                        <p style="margin:0;font-size:11px;font-weight:700;color:#94a3b8;text-transform:uppercase;letter-spacing:0.1em;">Location</p>
                        <p style="margin:4px 0 0;font-size:14px;font-weight:600;color:#334155;">📍 ${job.location}</p>
                      </td>
                      <td width="50%" style="padding-bottom:16px;">
                        <p style="margin:0;font-size:11px;font-weight:700;color:#94a3b8;text-transform:uppercase;letter-spacing:0.1em;">Salary</p>
                        <p style="margin:4px 0 0;font-size:14px;font-weight:600;color:#16a34a;">💰 ${job.salary || "Competitive"}</p>
                      </td>
                    </tr>
                    <tr>
                      <td colspan="2">
                        <p style="margin:0;font-size:11px;font-weight:700;color:#94a3b8;text-transform:uppercase;letter-spacing:0.1em;">Experience Required</p>
                        <p style="margin:4px 0 16px;font-size:14px;font-weight:600;color:#334155;">🎓 ${job.experience} years</p>
                      </td>
                    </tr>
                    ${job.requirements && job.requirements.length > 0 ? `
                    <tr>
                      <td colspan="2">
                        <p style="margin:0 0 10px;font-size:11px;font-weight:700;color:#94a3b8;text-transform:uppercase;letter-spacing:0.1em;">Skills Required</p>
                        <div>
                          ${job.requirements.map(r => `<span style="display:inline-block;background:#ede9fe;color:#6d28d9;font-size:11px;font-weight:700;padding:4px 12px;border-radius:20px;margin:0 6px 8px 0;border:1px solid #ddd6fe;">${r}</span>`).join("")}
                        </div>
                      </td>
                    </tr>` : ""}
                  </table>
                </td>
              </tr>
            </table>
            <!-- CTA -->
            <table width="100%" cellpadding="0" cellspacing="0">
              <tr>
                <td align="center">
                  <a href="${jobUrl}" style="display:inline-block;background:linear-gradient(135deg,#4f46e5,#7c3aed);color:#ffffff;text-decoration:none;font-size:14px;font-weight:700;padding:16px 40px;border-radius:12px;letter-spacing:0.05em;">
                    Apply Now →
                  </a>
                </td>
              </tr>
            </table>
            <p style="margin:28px 0 0;font-size:13px;color:#94a3b8;text-align:center;line-height:1.6;">
              This alert was sent because your skills match this job's requirements.<br/>
              <a href="http://localhost:5173" style="color:#6d28d9;text-decoration:none;font-weight:600;">Visit CareerLink</a>
            </p>
          </td>
        </tr>
        <!-- Footer -->
        <tr>
          <td style="background:#f8fafc;border-top:1px solid #e2e8f0;padding:20px 40px;text-align:center;">
            <p style="margin:0;font-size:11px;color:#94a3b8;font-weight:600;text-transform:uppercase;letter-spacing:0.1em;">
              CareerLink © ${new Date().getFullYear()} · Connecting talent with opportunity
            </p>
          </td>
        </tr>
      </table>
    </td></tr>
  </table>
</body>
</html>
`

// ── Routes ───────────────────────────────────────────────────────────────────

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

        const { title, description, companyName, location, salary, requirements, experience } = req.body
        const newJob = new Job({
            title,
            description,
            companyName,
            location,
            salary,
            requirements,
            experience: experience || "0-1",
            recruiter: req.user.id
        })

        await newJob.save()

        // ── Notification for the recruiter ────────────────────────────────
        await Notification.create({
            recipient: req.user.id,
            recipientRole: "recruiter",
            message: `Your job "${title}" was posted successfully.`,
            link: `/jobs/${newJob._id}`
        })

        // ── Email matched job seekers based on skill overlap ──────────────
        if (requirements && requirements.length > 0) {
            // Case-insensitive skill match
            const regexFilters = requirements.map(skill => new RegExp(`^${skill}$`, "i"))
            const matchedSeekers = await JobSeeker.find({
                skills: { $in: regexFilters },
                isVerified: true
            }).select("name email")

            const jobUrl = `http://localhost:5173/jobs/${newJob._id}`

            // Send emails + in-app notifications concurrently (fire-and-forget)
            const emailPromises = matchedSeekers.map(async (seeker) => {
                try {
                    // Email
                    await transporter.sendMail({
                        from: `"CareerLink" <${process.env.EMAIL_USER}>`,
                        to: seeker.email,
                        subject: `🚀 New Job Alert: ${title} at ${companyName}`,
                        html: jobAlertHtml(seeker, newJob, jobUrl)
                    })
                    // In-app notification
                    await Notification.create({
                        recipient: seeker._id,
                        recipientRole: "jobseeker",
                        message: `New job matching your skills: "${title}" at ${companyName} (${location})`,
                        link: `/jobs/${newJob._id}`
                    })
                } catch (e) {
                    console.error(`Failed to notify seeker ${seeker.email}:`, e.message)
                }
            })

            // Don't await — respond immediately, emails send in background
            Promise.all(emailPromises).catch(console.error)
        }

        res.status(201).json(newJob)
    } catch (err) {
        console.error("Failed to create job:", err)
        res.status(500).json({ message: "Failed to create job" })
    }
})

// Update job (Recruiter only, must own the job)
router.put("/:id", authMiddleware, async (req, res) => {
    try {
        if (req.user.role !== "recruiter") {
            return res.status(403).json({ message: "Only recruiters can update jobs" })
        }

        const job = await Job.findById(req.params.id)
        if (!job) return res.status(404).json({ message: "Job not found" })

        if (job.recruiter.toString() !== req.user.id) {
            return res.status(403).json({ message: "You can only update your own job posts" })
        }

        const { title, description, companyName, location, salary, requirements, experience } = req.body
        job.title = title ?? job.title
        job.description = description ?? job.description
        job.companyName = companyName ?? job.companyName
        job.location = location ?? job.location
        job.salary = salary ?? job.salary
        job.requirements = requirements ?? job.requirements
        job.experience = experience ?? job.experience

        await job.save()
        res.status(200).json(job)
    } catch (err) {
        res.status(500).json({ message: "Failed to update job" })
    }
})

// Delete job (Recruiter only, must own the job)
router.delete("/:id", authMiddleware, async (req, res) => {
    try {
        if (req.user.role !== "recruiter") {
            return res.status(403).json({ message: "Only recruiters can delete jobs" })
        }

        const job = await Job.findById(req.params.id)
        if (!job) return res.status(404).json({ message: "Job not found" })

        if (job.recruiter.toString() !== req.user.id) {
            return res.status(403).json({ message: "You can only delete your own job posts" })
        }

        await job.deleteOne()
        res.status(200).json({ message: "Job deleted successfully" })
    } catch (err) {
        res.status(500).json({ message: "Failed to delete job" })
    }
})

module.exports = router
