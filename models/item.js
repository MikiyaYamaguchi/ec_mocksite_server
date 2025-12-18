const mongoose = require("mongoose")
const Schema = mongoose.Schema

const itemSchema = new Schema({
	name: {
		type: String,
		required: true
	},
	price: {
		type: Number,
		required: true
	},
	context: {
		type: String,
		required: false
	},
	img1: {
		type: String,
		required: true
	},
	img2: {
		type: String,
		required: false
	},
	img3: {
		type: String,
		required: false
	},
	stock: {
		type: Number,
		required: true,
		default: 0
	},
	category: {
		type: String,
		required: false
	},
	tag: {
		type: [String],
		required: false
	},
	release_date: {
		type: Date,
		default: Date.now
	},
	variations: {
		type: [
			{ key: String, values: [String] }
		],
		required: false,
		_id: false
	},
	variations_prices: {
		type: [
			{ value: String, price: Number }
		],
		required: false
	},
	active: {
		type: Number,
		default: 1
	},
	isDeleted: {
		type: Number,
		default: 0
	}
})

const ItemModel = mongoose.model("Item", itemSchema)

module.exports = ItemModel