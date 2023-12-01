import express from "express";
import Product from "../models/product-model.js";

const router = express.Router();

// Fetch Product
router.get("/", async (req, res) => {
  const arg = req.query;

  /*
  http://localhost:8080/products?category=Stickers
  { category: 'Stickers' }
  http://localhost:8080/products?id=4
  { id: '4' }
  http://localhost:8080/products?q=%E8%B2%9D%E6%9E%9C
  { q: '貝果' }
  */

  // let query = Product.find({}).populate("category", "label");
  let query = Product.find({});
  let totalProductsQuery = Product.find({});

  if (arg.category) {
    query = Product.find({ category: arg.category });
    totalProductsQuery = Product.find({ category: arg.category });
  }

  if (arg.id) {
    query = Product.find({ _id: arg.id });
    totalProductsQuery = Product.find({ _id: arg.id });
  }

  if (arg.q) {
    // 模糊查詢: 正則表達式 new RegExp(obj), i 表示不分大小寫
    const reg = new RegExp(arg.q, "i");
    query = Product.find({ $or: [{ title: { $regex: reg } }, { description: { $regex: reg } }, { size: { $regex: reg } }] });
    totalProductsQuery = Product.find({ $or: [{ title: { $regex: reg } }, { description: { $regex: reg } }, { size: { $regex: reg } }] });

    // query = Product.find({ title: arg.q });
    // const product = await Product.find({ title: q }).exec();
  }

  // total
  const totalProducts = await totalProductsQuery.count().exec();

  // Pagination
  if (req.query._page && req.query._limit) {
    const pageSize = req.query._limit;
    const page = req.query._page;
    query = query.skip(pageSize * (page - 1)).limit(pageSize);
  }

  try {
    const product = await query.exec();
    // Access-Control-Expose-Headers: 設定 Server 支持的 Header 訊息
    res.set({
      "Access-Control-Expose-Headers": "X-Total-Count",
    });
    res.set("X-Total-Count", totalProducts);
    return res.status(200).send(product);
  } catch (err) {
    console.log(err);
    return res.status(500).send(err);
  }
});

// Fetch Product by id
router.get("/:_id", async (req, res) => {
  const { _id } = req.params;

  try {
    const product = await Product.find({ _id }).exec();
    return res.status(200).send(product);
  } catch (err) {
    return res.status(500).send(err);
  }
});

/*
// Fetch All Product
router.get("/", async (req, res) => {
  try {
    const product = await Product.find({}).exec();
    return res.status(200).send(product);
  } catch (err) {
    return res.status(500).send(err);
  }
});

// Create
router.post("/", async (req, res) => {
  try {
    const product = new Product(req.body);
    // product.discountPrice = Math.round(product.price * (1 - product.discountPercentage / 100));
    const saveProduct = await product.save();
    console.log(saveProduct.images[0]);
    return res.status(200).send(saveProduct);
  } catch (err) {
    return res.status(500).send(err);
  }
});
*/

export default router;
