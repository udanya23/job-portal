const express = require("express")
const router = express.Router()
const Notification = require("../models/Notification")
const authMiddleware = require("../middleware/authMiddleware")

// Get all notifications for the logged-in user
router.get("/", authMiddleware, async (req, res) => {
    try {
        const notifications = await Notification.find({
            recipient: req.user.id,
            recipientRole: req.user.role
        }).sort({ createdAt: -1 }).limit(50)

        res.status(200).json(notifications)
    } catch (err) {
        res.status(500).json({ message: "Failed to fetch notifications" })
    }
})

// Mark a single notification as read
router.patch("/:id/read", authMiddleware, async (req, res) => {
    try {
        const notification = await Notification.findOneAndUpdate(
            { _id: req.params.id, recipient: req.user.id },
            { isRead: true },
            { new: true }
        )
        if (!notification) return res.status(404).json({ message: "Notification not found" })
        res.status(200).json(notification)
    } catch (err) {
        res.status(500).json({ message: "Failed to mark notification as read" })
    }
})

// Mark all notifications as read
router.patch("/read-all", authMiddleware, async (req, res) => {
    try {
        await Notification.updateMany(
            { recipient: req.user.id, recipientRole: req.user.role, isRead: false },
            { isRead: true }
        )
        res.status(200).json({ message: "All notifications marked as read" })
    } catch (err) {
        res.status(500).json({ message: "Failed to mark all as read" })
    }
})

// Clear all read notifications
router.delete("/clear", authMiddleware, async (req, res) => {
    try {
        await Notification.deleteMany({
            recipient: req.user.id,
            recipientRole: req.user.role,
            isRead: true
        })
        res.status(200).json({ message: "Read notifications cleared" })
    } catch (err) {
        res.status(500).json({ message: "Failed to clear notifications" })
    }
})

// Delete a single notification
router.delete("/:id", authMiddleware, async (req, res) => {
    try {
        const notification = await Notification.findOneAndDelete({
            _id: req.params.id,
            recipient: req.user.id
        })
        if (!notification) return res.status(404).json({ message: "Notification not found" })
        res.status(200).json({ message: "Notification deleted" })
    } catch (err) {
        res.status(500).json({ message: "Failed to delete notification" })
    }
})

module.exports = router
