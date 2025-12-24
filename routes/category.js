
const express = require("express")
const router = express.Router()

const categoryModel = require("../models/category")

//すべてのカテゴリーを取得するAPI
router.get("/", async (req, res) => {
	try {
		const allCategories = await categoryModel.find()
		res.status(200).json({
			data: allCategories
		})
	} catch(err) {
		res.status(500).json({
			message: "エラーが発生しました。",
			error: err.message
		})
	}
})

//スラッグをもとにカテゴリーを一つ取得するAPI
router.get("/single/:slug", async (req, res) => {
	try {
		const singleCategory = await categoryModel.findOne({slug: req.params.slug})
		res.status(200).json({
			data: singleCategory
		})
	} catch(err) {
		res.status(500).json({
			message: "エラーが発生しました。",
			error: err.message
		})
	}
})

//カテゴリーを登録するAPI
router.post("/", async (req, res) => {
	try {
		createCategory = await categoryModel.create(req.body)
		res.status(200).json({
			data: createCategory
		})
	} catch(err) {
		res.status(500).json({
			message: "エラーが発生しました。",
			error: err.message
		})
	}
})

//カテゴリーを更新するAPI
router.put("/:id", async (req, res) => {
	try {
		const updateCategory = await categoryModel.findByIdAndUpdate(
			req.params.id,
			req.body,
			{
				new: true,
				runValidators: true
			}
		)
		if(!updateCategory) {
			return res.status(404).json({
				message: "カテゴリーが見つかりませんでした。"
			})
		}
		res.status(200).json({
			data: updateCategory
		})
	} catch(err) {
		res.status(500).json({
			message: "エラーが発生しました。",
			error: err.message
		})
	}
})

//カテゴリーを削除するAPI
router.delete("/:id", async (req, res) => {
	try {
		const deleteCategory = await categoryModel.findByIdAndDelete(req.params.id)
		if(!deleteCategory) {
			return res.status(404).json({
				message: "カテゴリーが見つかりませんでした。"
			})
		}
		res.status(200).json({
			data: deleteCategory
		})
	} catch(err) {
		res.status(500).json({
			message: "エラーが発生しました。",
			error: err.message
		})
	}
})

module.exports = router