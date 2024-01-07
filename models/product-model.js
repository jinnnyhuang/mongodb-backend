import mongoose from "mongoose";
const Schema = mongoose.Schema;

const productSchema = new Schema({
  title: { type: String, required: [true, "Please add a product name"], unique: true },
  description: { type: String },
  size: { type: String },
  stock: { type: Number, min: [0, "wrong min stock"], default: 0, required: true },
  price: { type: Number, min: [1, "wrong min price"], max: [10000, "wrong max price"], required: true },
  discountPercentage: { type: Number, min: [1, "wrong min discount"], max: [100, "wrong max discount"] },
  // discountPrice: { type: Number },
  category: { type: String, required: true },
  // category: { type: mongoose.Schema.Types.ObjectId, ref: "Category", required: true }, // Category._id
  images: { type: [Object], required: true }, //
  thumbnail: { type: String, required: true },
});

export default mongoose.model("Product", productSchema, "product"); //
