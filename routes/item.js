const express = require("express")
const router = express.Router()

const ItemModel = require("../models/item")

const authMiddleware = require("../middlewares/auth")
const authorizeSelfForItem = require("../middlewares/authorizeSelfForItem")

const { generateVariationsPrices } = require("../utils/variations");

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

//商品絞り込み検索API
router.get("/search/", async (req, res) => {
	try {
		const {
			keyword,
			category,
			tag,
			sort,
			price
		} = req.query

		//キーワード検索
		const query = {
			isDeleted: 0,
			active: 1
		}

		if(keyword) {
			query.$or = [
				{ name: { $regex: keyword, $options: "i" } },
				{ context: { $regex: keyword, $options: "i" } }
			]
		}

		//カテゴリー検索
		if(category) {
			query.category = category
		}

		//タグ検索
		if(tag) {
			const tags = Array.isArray(tag) ? tag : tag.split(",")
			query.tag = { $in: tags }
		}

		//価格上限検索
		if(price) {
			query.price = { $lte: Number(price) }
		}

		//ソート条件検索
		const sortCondition = {}
		switch(sort) {
			case "price_asc":
				sortCondition.price = 1;
				break;
			case "price_desc":
				sortCondition.price = -1;
				break;
			case "new":
				sortCondition.release_date = -1;
				break;
			case "stock":
				sortCondition.stock = -1;
				break;
			default:
				sortCondition.release_date = -1;
		}

		//DB検索
		const items = await ItemModel.find(query).sort(sortCondition)

		res.status(200).json({
			count: items.length,
			data: items
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
router.post("/", authMiddleware, async (req, res) => {
	try {
		const variations_prices = generateVariationsPrices(req.body.variations || [], req.body.price);

		const createdItem = await ItemModel.create({
			variations_prices: variations_prices,
			...req.body
	})
		res.status(201).json(createdItem)
	} catch(err) {
		res.status(500).json({
			message: "エラーが発生しました。",
			error: err.message
		})
	}
})

//商品を更新するAPI
router.put("/:id", authMiddleware, authorizeSelfForItem, async(req, res) => {
	try {
		const variations_prices = generateVariationsPrices(req.body.variations || [], req.body.price);

		const updateItem = await ItemModel.findByIdAndUpdate(
			req.params.id,
			{variations_prices: variations_prices, ...req.body},
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
router.delete("/:id", authMiddleware, authorizeSelfForItem, async(req, res) => {
	try {
		const deleteItem = await ItemModel.findByIdAndDelete(req.params.id)
		if(!deleteItem) {
			return res.status(404).json({
				message: "データが見つかりませんでした。"
			})
		}
		res.status(200).json({
			message: "データを削除しました。"
		})
	} catch(err) {
		res.status(500).json({
			message: "エラーが発生しました。",
			error: err.message
		})
	}
})

//商品をソフトデリートするAPI
router.put("/soft-delete/:id",  authMiddleware, authorizeSelfForItem, async (req, res) => {
	try {
		const deleteItem = await ItemModel.findById(req.params.id)
		if(!deleteItem) {
			return res.status(404).json({
				message: "データが見つかりませんでした。"
			})
		}
		deleteItem.isDeleted = 1
		await deleteItem.save()

		res.status(200).json({
			message: "商品をソフトデリートしました。",
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