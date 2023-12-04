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
      const saveCart = await cart.save();
      const result = await saveCart.populate({ path: "cartItems.productId", model: "Product" });
      return res.status(200).send(result);
    }

    let updateCartItems;
    if (product.length > 0) {
      if (product[0]?.productId.stock > product[0]?.quantity) {
        // 產品已在購物車時，數量 +1
        const result = await updateQuantity("increase", req.user._id, productId);
        return res.status(200).send(result);
      }
      return res.status(200).send({ message: "Out of stock" });
    } else if (product.length === 0) {
      // 產品未加入購物車，將 productId 新增至 cartItems
      updateCartItems = await Cart.findOneAndUpdate(
        { userId: req.user._id },
        { $push: { cartItems: { productId, quantity: 1 } } },
        { new: true }
      ).exec();
      const result = await updateCartItems.populate({ path: "cartItems.productId", model: "Product" });
      return res.status(200).send(result);
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
        const result = await updateQuantity("decrease", req.user._id, productId);
        return res.status(200).send(result);
      } else {
        // 從購物車移除
        const result = await removeCartItems(req.user._id, cartItemsId);
        return res.status(200).send(result);
      }
    } else if (operation === "increase") {
      if (product[0].productId.stock > product[0].quantity) {
        // 數量 ++
        const result = await updateQuantity("increase", req.user._id, productId);
        return res.status(200).send(result);
      }
    } else {
      // 更改數量
      if (product[0].productId.stock > value) {
        const result = await updateQuantity("change", req.user._id, productId, value);
        return res.status(200).send(result);
      } else {
        await updateQuantity("change", req.user._id, productId, product[0].productId.stock);
        return res.status(200).send({ message: `Sorry, we only have ${product[0].productId.stock} of that item available.` });
        // `抱歉，該商品只有 ${product[0].productId.stock} 件`
      }
    }
    return res.status(200).send({ message: "Out of stock" });
  } catch (err) {
    return res.status(500).send(err);
  }
});

// Remove Cart Items
router.delete("/:cartItemsId", async (req, res) => {
  const { cartItemsId } = req.params;

  try {
    const result = await removeCartItems(req.user._id, cartItemsId);
    return res.status(200).send(result);
  } catch (err) {
    return res.status(500).send(err);
  }
});

// Clear Cart
router.delete("/", async (req, res) => {
  try {
    const result = await Cart.deleteOne({ userId: req.user._id }).exec();
    return res.status(200).send(result);
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
  const updateCartItems = await Cart.findOneAndUpdate({ userId }, update, { arrayFilters: [{ "el.productId": productId }], new: true }).exec();
  const result = await updateCartItems.populate({ path: "cartItems.productId", model: "Product" });
  return result;
};

/*
// arrayFilters
// https://stackoverflow.com/questions/55841629/mongoose-update-a-field-in-an-object-of-array
// $set $inc
// https://stackoverflow.com/questions/66969846/i-cannot-use-set-operator-and-inc-operator-together-only-one-is-working-in-my

updateCartItems = await Cart.findOneAndUpdate(
  { userId: req.user._id },
  // { $set: { "cartItems.$[el].quantity": 1 } }, // 數量更改為 1
  { $inc: { "cartItems.$[el].quantity": 1 } }, // 數量 ++
  { arrayFilters: [{ "el.productId": productId }], new: true }
).exec();
*/

const removeCartItems = async (userId, cartItemsId) => {
  // const cart = await Cart.findOneAndUpdate({ userId }, { $pull: { cartItems: { productId } } }, { new: true }).exec();
  const cart = await Cart.findOneAndUpdate({ userId }, { $pull: { cartItems: { _id: cartItemsId } } }, { new: true }).exec();
  const result = await cart.populate({ path: "cartItems.productId", model: "Product" });
  return result;
};
// https://stackoverflow.com/questions/35973960/mongoose-remove-object-from-array-based-on-id-cast-error
// populate
// https://stackoverflow.com/questions/14594511/mongoose-populate-within-an-object?rq=1

export default router;
