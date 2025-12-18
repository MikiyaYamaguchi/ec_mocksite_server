const ItemModel = require("../models/item")

const authorizeSelfForItem = async (req, res, next) => {
	const item = await ItemModel.findById(req.params.id)
	if(!item) {
		return res.status(404).json({
			message: "商品が見つかりませんでした。"
		})
	}

	next()
}

module.exports = authorizeSelfForItem