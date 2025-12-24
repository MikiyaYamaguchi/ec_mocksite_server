
const express = require("express")
const router = express.Router()

const tagModel = require("../models/tag")

//すべてのカテゴリーを取得するAPI
router.get("/", async (req, res) => {
	try {
		const allTags = await tagModel.find()
		res.status(200).json({
			data: allTags
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
		const singleTag = await tagModel.findOne({slug: req.params.slug})
		res.status(200).json({
			data: singleTag
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
		createtag = await tagModel.create(req.body)
		res.status(200).json({
			data: createtag
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
		const updateTag = await tagModel.findByIdAndUpdate(
			req.params.id,
			req.body,
			{
				new: true,
				runValidators: true
			}
		)
		if(!updateTag) {
			return res.status(404).json({
				message: "カテゴリーが見つかりませんでした。"
			})
		}
		res.status(200).json({
			data: updateTag
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
		const deleteTag = await tagModel.findByIdAndDelete(req.params.id)
		if(!deleteTag) {
			return res.status(404).json({
				message: "カテゴリーが見つかりませんでした。"
			})
		}
		res.status(200).json({
			data: deleteTag
		})
	} catch(err) {
		res.status(500).json({
			message: "エラーが発生しました。",
			error: err.message
		})
	}
})

module.exports = router