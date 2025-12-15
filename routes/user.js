const express = require('express');
const router = express.Router();
const bcrypt = require("bcrypt")
const crypto = require("crypto")
const jwt = require("jsonwebtoken")

const UserModel = require("../models/user")

//ユーザーを登録するAPI
router.post("/", async (req, res) => {
  try {
    console.log("reqの中身：", req.body);
    const createdUser = await UserModel.create(req.body)
    res.status(201).json(createdUser)
  } catch(err) {
    res.status(500).json({
      message: "エラーが発生しました。",
      error: err.message
    })
  }
})

//ユーザーがログインするAPI
router.post("/login/", async (req, res) => {
  try {
    const { email, password } = req.body
    const loginUser = await UserModel.findOne({email})
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
      process.env.JWT_SECRET,
      { expiresIn: "30m" }
    )

    //リフレッシュトークン生成
    const refreshToken = crypto.randomBytes(64).toString("hex")

    //ハッシュ化して、DBに保存
    const hashedRefreshToken = await bcrypt.hash(refreshToken, 10)
    loginUser.refreshToken = hashedRefreshToken
    await loginUser.save()

    //HttpOnly Cookie に保存（Refresh Token と userId）
    res.cookie("refreshToken", refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 7 * 24 * 60 * 60 * 1000
    })
    //HttpOnly Cookie に保存
    res.cookie("userId", loginUser._id.toString(), {
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

//Refresh API
router.post("/refresh", async(req, res) => {
  try {
    // Cookie に保存されたリフレッシュトークンとユーザーIDを取得
    const refreshTokenFromCookie = req.cookies.refreshToken
    const userId = req.cookies.userId

    if (!refreshTokenFromCookie || !userId) {
      return res.status(401).json({ message: "リフレッシュトークンがありません" })
    }

    // DBから該当ユーザーを取得
    const user = await UserModel.findById(userId)
    if(!user || !user.refreshToken) {
      return res.status(401).json({
        message: "無効なリフレッシュトークンです。"
      })
    }

    // ハッシュ化されたリフレッシュトークンと照合
    const isValid = await bcrypt.compare(refreshTokenFromCookie, user.refreshToken)
    if (!isValid) {
      return res.status(401).json({ message: "無効なリフレッシュトークンです" })
    }

    // 新しい Access Token 発行
    const payload = {
      userId: user._id,
      email: user.email
    }
    const newAccessToken = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: "30m" })

    //新しい Refresh Token を生成・ハッシュ化して、DB更新
    const newRefreshToken = crypto.randomBytes(64).toString("hex")
    const hashedNewRefreshToken = await bcrypt.hash(newRefreshToken, 10)
    user.refreshToken = hashedNewRefreshToken
    await user.save()

    //cookie更新
    res.cookie("refreshToken", newRefreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 7 * 24 * 60 * 60 * 1000
    })
    res.cookie("userId", user._id.toString(), {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
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
    const userId = req.cookies.userId

    if (userId) {
      await UserModel.updateOne(
        { _id: userId },
        { $unset: { refreshToken: "" } }
      )
    }

    res.clearCookie("refreshToken")
    res.clearCookie("userId")
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
