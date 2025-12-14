const express = require('express');
const router = express.Router();

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

module.exports = router;
