import mongoose from "mongoose";
const Schema = mongoose.Schema;

const cartSchema = new Schema({
  userId: { type: Schema.Types.ObjectId, ref: "User", required: true, unique: true },
  cartItems: [
    { productId: { type: Schema.Types.ObjectId, ref: "Product", required: true, unique: true }, quantity: { type: Number, required: true } },
  ],
});

export default mongoose.model("Cart", cartSchema, "cart");
