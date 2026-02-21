const mongoose = require("mongoose")

const applicationSchema = new mongoose.Schema({
    job: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Job",
        required: true
    },
    applicant: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "JobSeeker",
        required: true
    },
    status: {
        type: String,
        enum: ["Applied", "Interviewing", "Accepted", "Rejected", "Pending"],
        default: "Applied"
    },
    appliedDate: {
        type: Date,
        default: Date.now
    }
})

module.exports = mongoose.model("Application", applicationSchema)
