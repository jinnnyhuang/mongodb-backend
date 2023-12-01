import express from "express";
import User from "../models/user-model.js";
import { updateUserValidation } from "../validate.js";

const router = express.Router();

// Fetch
router.get("/", async (req, res) => {
  // deserializeUser() -> req.user
  try {
    const foundUser = await User.find({ _id: req.user._id }).exec();
    // 才不告訴你密碼
    const user = { ...foundUser[0]._doc, password: "Like I would tell you." };
    console.log(user);
    return res.status(200).send({ user });
  } catch (err) {
    return res.status(400).send(err);
  }
});

// Edit
router.patch("/update/:_id", async (req, res) => {
  const { error } = updateUserValidation(req.body);
  if (error) return res.status(400).send({ field: error.details[0].path[0], message: error.details[0].message });

  const { _id } = req.params;
  try {
    const editUser = await User.findByIdAndUpdate(_id, req.body, { new: true });
    const user = { ...editUser._doc, password: "Like I would tell you." };
    console.log(user);
    return res.status(200).send({
      message: "已修改使用者資料。",
      user,
    });
  } catch (err) {
    console.log(err);
    return res.status(500).send({ message: "無法修改使用者資料。" });
  }
});

export default router;
