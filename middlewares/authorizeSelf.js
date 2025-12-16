const authorizeSelf = (req, res, next) => {
	const requiredUserId = req.params.requiredUserId
	const tokenUserId = req.user.userId

	if(requiredUserId != tokenUserId) {
		return res.status(403).json({
			message: "この操作を行う権限がありません。"
		})
	}

	next()
}

module.exports = authorizeSelf