const router = require("express").Router();
const Contact = require("./contact");

router.get("/test", (req, res) => {
  return res.send("test!");
});

// router.get("/", async (req, res) => {
//   try {
//     let foundAllContact = await Contact.find({}).exec();
//     if (foundAllContact.length === 0) return res.status(400).send("無資料。");
//     return res.send(foundAllContact);
//   } catch (error) {
//     return res.status(500).send(error);
//   }
// });

router.post("/", async (req, res) => {
  let { name, email, subject, message } = req.body;
  try {
    let newContact = new Contact({ name, email, subject, message });
    await newContact.save();
    return res.send("已收到您的聯繫。");
  } catch (error) {
    console.log(error);
    return res.status(500).send("提交失敗，。");
  }
});

module.exports = router; // !!
