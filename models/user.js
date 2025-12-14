const mongoose = require("mongoose")
const bcrypt = require("bcrypt")
const Schema = mongoose.Schema

const userSchema = new Schema({
	name: {
		type: String,
		required: true
	},
	email: {
		type: String,
		required: true
	},
	password: {
		type: String,
		required: false
	},
	birthday: {
		type: Date,
		required: false
	},
	sex: {
		type: String,
		required: false
	},
	age: {
		type: Number,
		required: false
	},
	registration_date: {
		type: Date,
		default: Date.now
	}
})

//パスワードを保存前にハッシュ化
userSchema.pre("save", async function(next) {
	if(!this.isModified("password")) return next();

	try {
		const hashed = await bcrypt.hash(this.password, 10)
		this.password = hashed
	} catch(err) {
		throw err
	}
})

userSchema.set("toJSON", {
	transform: (doc, ret) => {
		delete ret.password;
		return ret;
	}
})


const UserModel = mongoose.model("User", userSchema)

module.exports = UserModel