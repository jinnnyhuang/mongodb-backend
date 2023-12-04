import express from "express";
import Collection from "../models/collection-model.js";

const router = express.Router();

// Fetch Collection by user
router.get("/", async (req, res) => {
  try {
    const result = await Collection.findOne({ userId: req.user._id }).populate({ path: "collectionItems", model: "Product" }).exec();
    if (!result) return res.status(200).send([]);
    return res.status(200).send(result.collectionItems);
  } catch (err) {
    return res.status(500).send(err);
  }
});

// Add To Collection
router.post("/", async (req, res) => {
  const { productId } = req.body;

  try {
    // collectionItems 不包含 productId 時新增
    const collection = await Collection.findOneAndUpdate(
      { userId: req.user._id, collectionItems: { $ne: productId } },
      { $push: { collectionItems: productId } },
      { new: true, upsert: true }
    ).exec();
    const result = await collection.populate({ path: "collectionItems", model: "Product" });
    return res.status(200).send(result);
  } catch (err) {
    return res.status(500).send(err);
  }
});

// Remove Collection Item
router.delete("/:productId", async (req, res) => {
  const { productId } = req.params;
  try {
    const collection = await Collection.findOneAndUpdate(
      { userId: req.user._id, collectionItems: { $eq: productId } },
      { $pull: { collectionItems: productId } },
      { new: true }
    ).exec();
    // const result = await collection.populate({ path: "collectionItems", model: "Product" });
    return res.status(200).send(collection);
  } catch (err) {
    return res.status(500).send(err);
  }
});

export default router;
