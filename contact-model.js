// const mongoose = require("mongoose");
// const { Schema } = mongoose;

import mongoose from "mongoose";
const Schema = mongoose.Schema;

const contactSchema = new Schema({
  name: { type: String, required: true },
  email: { type: String, required: true },
  subject: { type: String, required: true },
  message: { type: String, required: true },
  date: { type: Date, default: Date.now },
});

// module.exports = mongoose.model("Contact", contactSchema, "contact");
export default mongoose.model("Contact", contactSchema, "contact");
