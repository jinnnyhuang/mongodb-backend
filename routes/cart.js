import express from "express";
import Cart from "../models/cart-model.js";

const router = express.Router();

// Fetch Cart by user
router.get("/", async (req, res) => {
  try {
    const result = await Cart.findOne({ userId: req.user._id }).populate({ path: "cartItems.productId", model: "Product" }).exec();
    if (!result) return res.status(200).send([]);
    return res.status(200).send(result.cartItems);
  } catch (err) {
    return res.status(500).send(err);
  }
});

// Add To Cart
router.post("/", async (req, res) => {
  const { productId } = req.body;

  try {
    const product = await getProduct(req.user._id, productId);

    // 購物車為空時新增 Cart
    if (!product) {
      const cart = new Cart({ userId: req.user._id, cartItems: { productId, quantity: 1 } });
      await cart.save();
      return res.status(200).send({ code: 200, message: "已加入購物車", response: null });
    }

    if (product.length > 0) {
      if (product[0]?.productId.stock > product[0]?.quantity) {
        // 產品已在購物車時，數量 +1
        await updateQuantity("increase", req.user._id, productId);
        return res.status(200).send({ code: 200, message: "已加入購物車", response: null });
      } else {
        return res.status(200).send({ code: 200, message: `抱歉，該商品剩下 ${product[0].productId.stock} 件庫存`, response: null });
      }
    } else if (product.length === 0) {
      // 產品未加入購物車，將 productId 新增至 cartItems
      await Cart.updateOne({ userId: req.user._id }, { $push: { cartItems: { productId, quantity: 1 } } }).exec();
      return res.status(200).send({ code: 200, message: "已加入購物車", response: null });
    }
  } catch (err) {
    return res.status(500).send(err);
  }
});

// Update Quantity
router.patch("/:cartItemsId", async (req, res) => {
  const { productId, operation, value } = req.body;
  const { cartItemsId } = req.params;

  try {
    const product = await getProduct(req.user._id, productId);

    if (operation === "decrease") {
      if (product[0].quantity > 1) {
        // 數量 --
        await updateQuantity("decrease", req.user._id, productId);
      } else {
        // 從購物車移除
        await Cart.updateOne({ userId: req.user._id }, { $pull: { cartItems: { _id: cartItemsId } } }).exec();
        return res.status(200).send({ code: 200, message: null, response: null });
      }
    } else if (operation === "increase") {
      if (product[0].productId.stock > product[0].quantity) {
        // 數量 ++
        await updateQuantity("increase", req.user._id, productId);
      } else {
        return res.status(200).send({ code: 200, message: `抱歉，該商品剩下 ${product[0].productId.stock} 件庫存`, response: null });
      }
    } else {
      // 更改數量
      if (product[0].productId.stock >= value) {
        await updateQuantity("change", req.user._id, productId, value);
      } else {
        await updateQuantity("change", req.user._id, productId, product[0].productId.stock);
        return res.status(200).send({ code: 200, message: `抱歉，該商品剩下 ${product[0].productId.stock} 件庫存`, response: null });
      }
    }
    return res.status(200).send({ code: 200, message: null, response: null });
  } catch (err) {
    return res.status(500).send(err);
  }
});

// Remove Cart Items
router.delete("/:cartItemsId", async (req, res) => {
  const { cartItemsId } = req.params;

  try {
    await Cart.updateOne({ userId: req.user._id }, { $pull: { cartItems: { _id: cartItemsId } } }).exec();
    return res.status(200).send({ code: 200, message: null, response: null });
  } catch (err) {
    return res.status(500).send(err);
  }
});

// Clear Cart
router.delete("/", async (req, res) => {
  try {
    await Cart.deleteOne({ userId: req.user._id }).exec();
    return res.status(200).send({ code: 200, message: null, response: null });
  } catch (err) {
    return res.status(500).send(err);
  }
});

// ----------

const getProduct = async (userId, productId) => {
  const cart = await Cart.findOne({ userId }).populate({ path: "cartItems.productId", model: "Product" }).exec();
  if (!cart) return;
  const product = cart.cartItems.filter((item) => item.productId._id.equals(productId));
  if (product.length === 0) return [];
  return product;
};

const updateQuantity = async (operation, userId, productId, value) => {
  let sign = operation === "decrease" ? -1 : 1;
  let update = operation === "change" ? { $set: { "cartItems.$[el].quantity": value } } : { $inc: { "cartItems.$[el].quantity": sign } };
  await Cart.updateOne({ userId }, update, { arrayFilters: [{ "el.productId": productId }] }).exec();
};

export default router;
