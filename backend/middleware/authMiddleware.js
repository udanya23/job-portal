const jwt = require("jsonwebtoken")

const authMiddleware = (req, res, next) => {
    try {
        const token = req.headers["authorization"]
        if (!token || !token.startsWith("Bearer ")) {
            return res.status(401).json({ "message": "No token provided" })
        }
        const finalToken = token.split(" ")[1]
        const decoded = jwt.verify(finalToken, process.env.JWT_SECRET || "your-secret-key-change-this-in-production")
        req.user = decoded
        next()
    }
    catch (err) {
        return res.status(401).json({ "message": "Invalid token or token is expired" })
    }
}

module.exports = authMiddleware