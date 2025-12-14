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

//指定したカテゴリーに属する商品を全て取得するAPI
router.get("/category/:cat", async (req, res) => {
	try {
		const catItems = await ItemModel.find({category: req.params.cat})
		res.status(200).json({
			data: catItems
		})
	} catch(err) {
		res.status(500).json({
			message: "エラーが発生しました。",
			error: err.message
		})
	}
})

//指定したタグに属する商品を全て取得するAPI
router.get("/tag/:tag", async (req, res) => {
	try {
		const tagItems = await ItemModel.find({tag: req.params.tag})
		res.status(200).json({
			data: tagItems
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

//商品を更新するAPI
router.put("/:id", async(req, res) => {
	try {
		const updateItem = await ItemModel.findByIdAndUpdate(
			req.params.id,
			req.body,
			{
				new: true,
				runValidators: true
			}
		)

		if(!updateItem) {
			return res.status(404).json({
				message: "データが見つかりませんでした。"
			})
		}

		res.status(200).json({
			data: updateItem
		})

	} catch(err) {
		res.status(500).json({
			message: "エラーが発生しました。",
			error: err.message
		})
	}
})

//商品を削除するAPI
router.delete("/:id", async(req, res) => {
	try {
		const deleteItem = await ItemModel.findByIdAndDelete(req.params.id)
		if(!deleteItem) {
			return res.status(404).json({
				message: "データが見つかりませんでした。"
			})
		}
		res.status(200).json({
			data: deleteItem
		})
	} catch(err) {
		res.status(500).json({
			message: "エラーが発生しました。",
			error: err.message
		})
	}
})

module.exports = router;