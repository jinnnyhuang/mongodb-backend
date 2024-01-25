import passport from "passport";
import { Strategy as LocalStrategy } from "passport-local";
import { Strategy as GoogleStrategy } from "passport-google-oauth20";
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

passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: process.env.GOOGLE_CALLBACK_URL || "/auth/google/redirect",
    },
    async (accessToken, refreshToken, profile, done) => {
      const foundUser = await User.findOne({ googleID: profile.id }).exec();
      if (foundUser) {
        done(null, foundUser);
      } else {
        const newUser = new User({
          googleID: profile.id,
          email: profile.emails[0].value,
          // 使用 Google 註冊時，產生一組隨機密碼
          password: Math.random().toString(36).substring(2),
          name: profile.displayName,
        });
        const savedUser = await newUser.save();
        done(null, savedUser);
      }
    }
  )
);
