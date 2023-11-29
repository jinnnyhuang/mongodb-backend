/* const router = require("express").Router();
const User = require("../models/user-model");
const createUserValidation = require("../validate").createUserValidation;
const loginUserValidation = require("../validate").loginUserValidation; */

import express from "express";
import User from "../models/user-model.js";
import { createUserValidation } from "../validate.js";
import { loginUserValidation } from "../validate.js";
import passport from "passport";

const router = express.Router();

router.get("/test", (req, res) => {
  return res.send("test!");
});

router.post("/signup", async (req, res) => {
  const { error } = createUserValidation(req.body); // !
  // if (error) return res.status(400).send(error.details[0].message);
  if (error) return res.status(400).send({ field: error.details[0].path[0], message: error.details[0].message });

  const { email, password, name, phone } = req.body;
  const emailExist = await User.findOne({ email }).exec();
  if (emailExist) {
    return res.status(400).send({
      message: "此信箱已被註冊，請改用其他信箱註冊。",
    });
  }
  try {
    const newUser = new User({ email, password, name, phone });
    const saveUser = await newUser.save();
    return res.send({
      message: "感謝您加入會員，請登入開始使用網站。",
      // message: "Thanks for signing up. Please login to access the website.",
      // user: saveUser,
    });
  } catch (err) {
    console.log(err);
    return res.status(500).send({ message: "註冊失敗，請重新註冊。" });
  }
});

router.post("/login", (req, res, next) => {
  const { error } = loginUserValidation(req.body);
  // if (error) return res.status(400).send(error.details[0].message);
  if (error) return res.status(400).send({ field: error.details[0].path[0], message: error.details[0].message });

  // console.log(req.session);
  passport.authenticate("local", (err, user, info) => {
    if (err) return next(err);
    if (!user) return res.status(400).send({ message: info.message }); // verify function - done
    // 自定義 callback 需執行 logIn function，req.user 會存入 User
    req.logIn(user, (err) => {
      if (err) return next(err);
      // 才不告訴你密碼
      const userInfo = { ...user._doc, password: "Like I would tell you." };
      return res.send({ user: userInfo });
    });
  })(req, res, next);
});

router.post("/logout", (req, res) => {
  console.log(req.session);
  req.logout((err) => {
    // 移除 req.user
    if (err) return next(err);
    req.session.destroy();
    res.send("已登出。");
  });
});

// ----------------------------------------------------------------------------------------------------
// router.post("/login", async (req, res) => {
//   // const { error } = loginUserValidation(req.body);
//   // if (error) {
//   //   return res.status(400).send(error.details[0].message);
//   // }
//   const { email, password } = req.body;
//   const foundUser = await User.findOne({ email }).exec();
//   if (!foundUser) {
//     return res.status(401).send("查無此帳號，請重新輸入。");
//   }
//   try {
//     foundUser.comparePassword(password, (err, isMatch) => {
//       if (err) return res.status(500).send(err);
//       if (isMatch) {
//         return res.send({
//           message: `您已登入系統。`,
//           user: foundUser,
//         });
//       } else {
//         return res.status(401).send("您的帳號或密碼錯誤，請重新輸入。");
//       }
//     });
//   } catch (err) {
//     return res.status(500).send(err);
//   }
// });

// module.exports = router;
export default router;
