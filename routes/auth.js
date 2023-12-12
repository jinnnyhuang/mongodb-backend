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
  if (error) return res.status(400).send({ code: 400, field: error.details[0].path[0], message: error.details[0].message });

  const { email, password, name, phone } = req.body;
  const emailExist = await User.findOne({ email }).exec();
  if (emailExist) {
    return res.status(400).send({ code: 400, message: "此信箱已被註冊，請改用其他信箱註冊。" });
  }
  try {
    const newUser = new User({ email, password, name, phone });
    const saveUser = await newUser.save();
    return res.status(200).send({
      code: 200,
      message: "感謝您加入會員，請登入開始使用網站",
      response: null,
    });
  } catch (err) {
    return res.status(500).send(err);
  }
});

router.post("/login", (req, res, next) => {
  const { error } = loginUserValidation(req.body);
  if (error) return res.status(400).send({ code: 400, field: error.details[0].path[0], message: error.details[0].message });

  // console.log(req.session);
  try {
    passport.authenticate("local", (err, user, info) => {
      if (err) return next(err);
      if (!user) return res.status(401).send({ code: 401, message: info.message }); // verify function - done
      // 自定義 callback 需執行 logIn function，req.user 會存入 User
      req.logIn(user, (err) => {
        if (err) return next(err);
        // 才不告訴你密碼
        const userInfo = { ...user._doc, password: "Like I would tell you." };
        return res.status(200).send({ code: 200, message: null, response: userInfo });
      });
    })(req, res, next);
  } catch (err) {
    return res.status(500).send(err);
  }
});

router.post("/logout", (req, res) => {
  console.log(req.session);
  req.logout((err) => {
    // 移除 req.user
    if (err) return next(err);
    req.session.destroy();
    return res.status(200).send({ code: 200, message: "已登出", response: null });
  });
});

export default router;
