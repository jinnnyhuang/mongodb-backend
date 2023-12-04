import mongoose from "mongoose";
const Schema = mongoose.Schema;

const collectionSchema = new Schema({
  userId: { type: Schema.Types.ObjectId, ref: "User", required: true, unique: true },
  collectionItems: [{ type: Schema.Types.ObjectId, ref: "Product", required: true, unique: true }],
});

export default mongoose.model("Collection", collectionSchema, "collection");
