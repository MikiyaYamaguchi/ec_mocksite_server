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
    res.cookie("adminRefreshToken", refreshToken, {
      httpOnly: false,
      secure: false,
      sameSite: "lax",
      path: "/",
      maxAge: 7 * 24 * 60 * 60 * 1000
    })
    //HttpOnly Cookie に保存
    res.cookie("adminUserId", loginUser._id.toString(), {
      httpOnly: false,
      secure: false,
      sameSite: "lax",
      path: "/",
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

//Refresh API
router.post("/refresh", async(req, res) => {
  try {
    // Cookie に保存されたリフレッシュトークンとユーザーIDを取得
    const refreshTokenFromCookie = req.cookies.adminRefreshToken
    const userId = req.cookies.adminUserId

    if (!refreshTokenFromCookie || !userId) {
      return res.status(401).json({ message: "リフレッシュトークンがありません" })
    }

    // DBから該当ユーザーを取得
    const user = await AdminUserModel.findById(userId)
    if(!user || !user.adminRefreshToken) {
      return res.status(401).json({
        message: "無効なリフレッシュトークンです。"
      })
    }

    // ハッシュ化されたリフレッシュトークンと照合
    const isValid = await bcrypt.compare(refreshTokenFromCookie, user.adminRefreshToken)
    if (!isValid) {
      return res.status(401).json({ message: "無効なリフレッシュトークンです" })
    }

    // 新しい Access Token 発行
    const payload = {
      userId: user._id,
      email: user.email
    }
    const newAccessToken = jwt.sign(payload, process.env.JWT_SECRET_ADMIN, { expiresIn: "30m" })

    //新しい Refresh Token を生成・ハッシュ化して、DB更新
    const newRefreshToken = crypto.randomBytes(64).toString("hex")
    const hashedNewRefreshToken = await bcrypt.hash(newRefreshToken, 10)
    user.adminRefreshToken = hashedNewRefreshToken
    await user.save()

    //cookie更新
    res.cookie("adminRefreshToken", newRefreshToken, {
      httpOnly: false,
      secure: false,
      sameSite: "lax",
      path: "/",
      maxAge: 7 * 24 * 60 * 60 * 1000
    })
    res.cookie("adminUserId", user._id.toString(), {
      httpOnly: false,
      secure: false,
      sameSite: "lax",
      path: "/",
      maxAge: 7 * 24 * 60 * 60 * 1000
    })

    res.status(200).json({ accessToken: newAccessToken })
  } catch(err) {
    res.status(500).json({
      message: "エラーが発生しました。",
      error: err.message
    })
  }
})

//ログアウトAPI
router.post("/logout", async (req, res) => {
  try {
    const userId = req.cookies.adminUserId

    if (userId) {
      await AdminUserModel.updateOne(
        { _id: userId },
        { $unset: { adminRefreshToken: "" } }
      )
    }

    res.clearCookie("adminRefreshToken")
    res.clearCookie("adminUserId")
    res.status(200).json({
      message: "ログアウトしました。"
    })
  } catch(err) {
    res.status(500).json({
      message: "エラーが発生しました。",
      error: err.message
    })
  }
})

module.exports = router;