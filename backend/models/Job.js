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
    experience: {
        type: String,
        enum: ["0-1", "1-3", "3-5", "5+"],
        default: "0-1"
    },
    recruiter: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Recruiter",
        required: true
    },
    createdAt: {
        type: Date,
        default: Date.now
    },
    deadline: {
        type: Date
    }
})

module.exports = mongoose.model("Job", jobSchema)
