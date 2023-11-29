import passport from "passport";
import { Strategy as LocalStrategy } from "passport-local";
import User from "../models/user-model.js";
import bcrypt from "bcrypt";

// 將 user id 存入 session
passport.serializeUser((user, done) => {
  console.log(`Serialized: ${user._id}`);
  // 將 user._id 存入 session、cookie，並設定 req.isAuthenticated() = true
  done(null, user._id);
});

// 以 user id 取回的資料
passport.deserializeUser(async (_id, done) => {
  console.log(`Deserialized: ${_id}`);
  const foundUser = await User.findOne({ _id }).exec();
  // 執行時，自動將 req.user = foundUser
  done(null, foundUser);
});

passport.use(
  new LocalStrategy(
    {
      usernameField: "email",
    },
    async (username, password, done) => {
      const findUser = await User.findOne({ email: username }).exec();
      if (findUser) {
        const result = await bcrypt.compare(password, findUser.password);
        if (result) {
          return done(null, findUser); // serializeUser, deserializeUser
        } else {
          return done(null, false, { message: "電子郵件或密碼不正確。" });
        }
      } else {
        return done(null, false, { message: "查無此帳號，請重新輸入。" });
      }
    }
  )
);
