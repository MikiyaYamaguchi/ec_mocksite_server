const express = require("express")
const router = express.Router()

const ItemModel = require("../models/item")

//全ての商品を取得するAPI
router.get("/", async (req, res) => {
	try {
		const allItems = await ItemModel.find()
		res.status(200).json({
			data: allItems
		})
	} catch(err) {
		res.status(500).json({
			message: "エラーが発生しました。",
			error: err.message
		})
	}
})

//idを元に一つの商品を取得するAPI
router.get("/:id", async (req, res) => {
	try {
		const singleItem = await ItemModel.findById(req.params.id)
		res.status(200).json({
			data: singleItem
		})
	} catch(err) {
		res.status(500).json({
			message: "エラーが発生しました。",
			error: err.message
		})
	}
})

//商品を追加するAPI
router.post("/", async (req, res) => {
	try {
		console.log("reqの中身：", req.body);
		const createdItem = await ItemModel.create(req.body)
		res.status(201).json(createdItem)
	} catch(err) {
		res.status(500).json({
			message: "エラーが発生しました。",
			error: err.message
		})
	}
})

module.exports = router;