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
    const userInfo = { ...foundUser[0]._doc, password: "Like I would tell you." };
    return res.status(200).send({ code: 200, message: null, response: userInfo });
  } catch (err) {
    return res.status(400).send(err);
  }
});

// Edit
router.patch("/update/:_id", async (req, res) => {
  const { error } = updateUserValidation(req.body);
  if (error) return res.status(400).send({ code: 400, field: error.details[0].path[0], message: error.details[0].message });

  const { _id } = req.params;
  try {
    // const editUser = await User.findByIdAndUpdate(_id, req.body, { new: true });
    const editUser = await User.findByIdAndUpdate(_id, { $set: req.body, $currentDate: { modificationDate: true } }, { new: true });
    const userInfo = { ...editUser._doc, password: "Like I would tell you." };
    return res.status(200).send({
      code: 200,
      message: "修改成功",
      response: userInfo,
    });
  } catch (err) {
    return res.status(500).send(err);
  }
});

export default router;
