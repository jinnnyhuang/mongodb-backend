import mongoose from "mongoose";
const Schema = mongoose.Schema;

// 建立資料庫綱要 Schema
const cartSchema = new Schema({
  userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
  productId: { type: Schema.Types.ObjectId, ref: "Product", required: true },
  quantity: { type: Number, required: true },
});

export default mongoose.model("Cart", cartSchema, "cart");
