const jwt = require("jsonwebtoken")

const authMiddleware = (req, res, next) => {
	//Authorizationヘッダー取得
	const authHeader = req.headers.authorization

	if(!authHeader) {
		return res.status(401).json({
			message: "認証トークンがありません。"
		})
	}

	//Bearer token形式を想定
	const token = authHeader.split(" ")[1]

	if(!token) {
		return res.status(401).json({
			message: "トークン形式が正しくありません。"
		})
	}

	try {
		//トークン検証
		const decoded = jwt.verify(token, process.env.JWT_SECRET)
		req.user = decoded
		next()
	} catch(err) {
		return res.status(401).json({
			message: "トークンが無効または期限切れです。"
		})
	}
}

module.exports = authMiddleware