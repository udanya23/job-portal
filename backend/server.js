const express = require("express")
const mongoose = require("mongoose")
const cors = require("cors")
const cookieParser = require("cookie-parser")
require("dotenv").config()

const app = express()
const protectedRoutes = require("./routes/protected.js")

// Trust proxy is required if you are behind a load balancer (like Render)
// so that Express will accept the X-Forwarded-Proto header for 'secure' cookies
app.set("trust proxy", 1)

// Middleware
app.use(express.json())
app.use(express.urlencoded({ extended: true }))
app.use(cors({
    origin: "https://job-portal-1-hkru.onrender.com" || "http://localhost:5173", // Vite frontend URL
    credentials: true
}))
app.use(cookieParser())
app.use("/uploads", express.static("uploads"))

// MongoDB Connection
mongoose.connect(process.env.MONGODB_URL)
    .then(() => console.log("MongoDB connected successfully"))
    .catch((err) => console.log("MongoDB connection error:", err))

// Routes
const authRoutes = require("./routes/auth")
const jobRoutes = require("./routes/jobRoutes")
const applicationRoutes = require("./routes/applicationRoutes")
const notificationRoutes = require("./routes/notificationRoutes")

app.use("/api/auth", authRoutes)
app.use("/api/jobs", jobRoutes)
app.use("/api/applications", applicationRoutes)
app.use("/api/notifications", notificationRoutes)

const PORT = process.env.PORT || 5000
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`)
})

