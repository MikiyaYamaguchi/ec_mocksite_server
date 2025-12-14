require("dotenv").config()
const mongoose = require("mongoose")

//mongoDB接続URI
const mongoURI = process.env.MONGO_URI

//mongoDBに接続
const connectDB = async () => {
	try {
		await mongoose.connect(mongoURI)
		console.log("Success: Connected to MongoDB")
	} catch(err) {
		console.log("Failure: Unconnected to MongoDB")
		console.error(error)
	}
}

module.exports = connectDB