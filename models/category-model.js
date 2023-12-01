import mongoose from "mongoose";
const Schema = mongoose.Schema;

const categorySchema = new Schema({
  label: { type: String, required: true, unique: true },
});

export default mongoose.model("Category", categorySchema, "category");
