const mongoose = require("mongoose")

const connectDB = async (app) => {
    try {
        await mongoose.connect(process.env.MONGODB_URL)
        console.log("DB connected successfully")
    } catch (err) {
        console.error(err)
        process.exit(1)
    }
}

module.exports = connectDB
