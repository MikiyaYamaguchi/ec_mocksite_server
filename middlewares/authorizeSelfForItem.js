const ItemModel = require("../models/item")

const authorizeSelfForItem = async (req, res, next) => {
	const item = await ItemModel.findById(req.params.id)
	if(!item) {
		return res.status(404).json({
			message: "商品が見つかりませんでした。"
		})
	}

	if(item.createdBy.toString() !==  req.user.userId) {
		return res.status(403).json({
			message: "この操作を行う権限がありません。"
		})
	}

	next()
}

module.exports = authorizeSelfForItem