import mongoose from "mongoose";
import bcrypt from "bcrypt";
const Schema = mongoose.Schema;

const userSchema = new Schema({
  email: { type: String, required: true },
  password: { type: String, minLength: 8, maxLength: 255, required: true },
  name: { type: String, minLength: 3, maxLength: 50, required: true },
  googleID: { type: String, default: null },
  phone: { type: String, default: null },
  creationDate: { type: Date, default: Date.now },
  modificationDate: { type: Date, default: null },
});

userSchema.methods.comparePassword = async function (password, cb) {
  try {
    const result = await bcrypt.compare(password, this.password);
    return cb(null, result); // 驗證成功
  } catch (err) {
    return cb(err, result);
  }
};

// 當 middleware 調用下一個 middleware 時，Pre middleware function會先執行。
userSchema.pre("save", async function (next) {
  // async function, this = mongoDB doucment
  // 若是新用戶或修改密碼的用戶，進行雜湊處理：使用 bcrypt 加密，加鹽 10 次
  // isModified 確認使用者的 password 欄位是有被變更：初次建立及修改都算
  if (this.isModified("password")) {
    const hashValue = await bcrypt.hash(this.password, 10);
    this.password = hashValue;
  }
  next();
});

export default mongoose.model("User", userSchema, "user");
