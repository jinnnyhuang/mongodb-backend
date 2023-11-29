import express from "express";
import Cart from "../models/cart-model.js";

const router = express.Router();

router.get("/", async (req, res) => {
  const { _id } = req.user;
  const cartItems = await Cart.find({ userId: _id }).populate("product").exec();
  console.log(cartItems); // Test empty
  return res.send(cartItems);
});

router.post("/", async (req, res) => {});

router.patch("/:_id", async (req, res) => {});

router.delete("/:_id", async (req, res) => {});

export default router;
