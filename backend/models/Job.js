const mongoose = require("mongoose")

const jobSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true,
        trim: true
    },
    description: {
        type: String,
        required: true
    },
    companyName: {
        type: String,
        required: true,
        trim: true
    },
    location: {
        type: String,
        required: true,
        trim: true
    },
    salary: {
        type: String,
        trim: true
    },
    requirements: {
        type: [String],
        default: []
    },
    recruiter: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Recruiter",
        required: true
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
})

module.exports = mongoose.model("Job", jobSchema)
