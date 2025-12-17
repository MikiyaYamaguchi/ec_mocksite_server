const express = require('express');
const router = express.Router();
const bcrypt = require("bcrypt")
const crypto = require("crypto")
const jwt = require("jsonwebtoken")

const AdminUserModel = require("../models/admin_user")


//管理者を登録するAPI
router.post("/", async (req, res) => {
	try {
		const createdUser = await AdminUserModel.create(req.body)
		res.status(201).json(createdUser)
	} catch(err) {
		res.status(500).json({
			message: "エラーが発生しました。",
			error: err.message
		})
	}
})

//管理者がログインするAPI
router.post("/login/", async (req, res) => {
  try {
    const { email, password } = req.body
    const loginUser = await AdminUserModel.findOne({email})
    if(!loginUser) {
      return res.status(401).json({
        message: "パスワードまたはメールアドレスが違います。"
      })
    }

    //ハッシュ化パスワードを比較
    const isMatch = await bcrypt.compare(password, loginUser.password)
    if(!isMatch) {
      return res.status(401).json({
        message: "パスワードまたはメールアドレスが違います。"
      })
    }

    //JWTに含めるpayload
    const payload = {
      userId: loginUser._id,
      email: loginUser.email
    }

    //アクセストークン発行
    const accessToken = jwt.sign(
      payload,
      process.env.JWT_SECRET_ADMIN,
      { expiresIn: "30m" }
    )

    //リフレッシュトークン生成
    const refreshToken = crypto.randomBytes(64).toString("hex")

    //ハッシュ化して、DBに保存
    const hashedRefreshToken = await bcrypt.hash(refreshToken, 10)
    loginUser.adminRefreshToken = hashedRefreshToken
    await loginUser.save()

    //HttpOnly Cookie に保存（Refresh Token と userId）
    res.cookie("AdminRefreshToken", refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 7 * 24 * 60 * 60 * 1000
    })
    //HttpOnly Cookie に保存
    res.cookie("AdminUserId", loginUser._id.toString(), {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 7 * 24 * 60 * 60 * 1000
    })

    res.status(200).json({
      user: loginUser,
      accessToken
    })

  } catch(err) {
    res.status(500).json({
      message: "エラーが発生しました。",
      error: err.message
    })
  }
})

module.exports = router;