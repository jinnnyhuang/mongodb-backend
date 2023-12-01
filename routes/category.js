import express from "express";
import Category from "../models/category-model.js";

const router = express.Router();

// Fetch
router.get("/", async (req, res) => {
  try {
    const categories = await Category.find({}).exec();
    return res.status(200).send(categories);
  } catch (err) {
    return res.status(500).send(err);
  }
});

// // Create
// router.post("/", async (req, res) => {
//   try {
//     const category = new Category(req.body);
//     const saveCategory = await category.save();
//     return res.status(200).send(saveCategory);
//   } catch (err) {
//     return res.status(500).send(err);
//   }
// });

export default router;
