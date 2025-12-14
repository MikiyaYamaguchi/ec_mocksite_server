const express = require("express")
const router = express.Router()

const ItemModel = require("../models/item")

router.post("/", (req, res) => {
	console.log("reqの中身：", req.body);
	ItemModel.create(req.body).then((createdItem) => {
		res.json(createdItem)
	}).catch((err) => {
		res.render("error", {message: `サーバエラー：${err}`})
	})
})

module.exports = router;