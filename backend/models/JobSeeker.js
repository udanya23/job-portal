const mongoose = require("mongoose")

const jobSeekerSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true
    },
    email: {
        type: String,
        required: true,
        unique: true,
        lowercase: true,
        trim: true
    },
    password: {
        type: String,
        required: true
    },
    mobileNumber: {
        type: String,
        required: true,
        trim: true
    },
    address: {
        type: String,
        required: true,
        trim: true
    },
    gender: {
        type: String,
        required: true,
        enum: ["Male", "Female", "Other"]
    },
    verificationOtp: {
        type: String
    },
    otpExpires: {
        type: Date
    },
    isVerified: {
        type: Boolean,
        default: false
    },
    resetPasswordOtp: {
        type: String
    },
    resetPasswordExpires: {
        type: Date
    },
    profilePhoto: {
        type: String,
        default: ""
    },
    resume: {
        type: String,
        default: ""
    },
    bio: {
        type: String,
        trim: true,
        default: ""
    },
    skills: {
        type: [String],
        default: []
    },
    education: [{
        institution: String,
        degree: String,
        year: String
    }],
    experience: [{
        company: String,
        role: String,
        duration: String,
        description: String
    }],
    resumeHeadline: {
        type: String,
        trim: true,
        default: ""
    },
    currentSalary: {
        type: String,
        default: ""
    },
    totalExperience: {
        type: String,
        default: ""
    },
    availableToJoin: {
        type: String,
        default: ""
    },
    resumeOriginalName: {
        type: String,
        default: ""
    },
    resumeUploadedAt: {
        type: Date
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
})

module.exports = mongoose.model("JobSeeker", jobSeekerSchema)
