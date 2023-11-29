/* const router = require("express").Router();
const Contact = require("./contact-model"); */

import express from "express";
import Contact from "./contact-model.js";
const router = express.Router();

router.get("/test", (req, res) => {
  return res.send("test!");
});

// router.get("/", async (req, res) => {
//   try {
//     const foundAllContact = await Contact.find({}).exec();
//     if (foundAllContact.length === 0) return res.status(400).send("無資料。");
//     return res.send(foundAllContact);
//   } catch (err) {
//     return res.status(500).send(err);
//   }
// });

router.post("/", async (req, res) => {
  const { name, email, subject, message } = req.body;
  try {
    const newContact = new Contact({ name, email, subject, message });
    await newContact.save();
    return res.send("已收到您的聯繫。");
  } catch (err) {
    console.log(err);
    return res.status(500).send("提交失敗。");
  }
});

// module.exports = router;
export default router;
