const mongoose = require("mongoose")
const bcrypt = require("bcrypt")
const Schema = mongoose.Schema

const adminUserSchema = new Schema({
	name: {
		type: String,
		required: true
	},
	email: {
		type: String,
		required: true,
		unique: true,
		index: true
	},
	password: {
		type: String,
		required: false
	},
	adminRefreshToken: {
		type: String,
		required: false,
		default: ""
	}
})

//パスワードを保存前にハッシュ化
adminUserSchema.pre("save", async function(next) {
	if(!this.isModified("password")) return;

	try {
		const hashed = await bcrypt.hash(this.password, 10)
		this.password = hashed
	} catch(err) {
		throw err
	}
})

adminUserSchema.set("toJSON", {
	transform: (doc, ret) => {
		delete ret.password;
		delete ret.adminRefreshToken;
		return ret;
	}
})


const AdminUserModel = mongoose.model("AdminUser", adminUserSchema)

module.exports = AdminUserModel