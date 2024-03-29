import "dotenv/config";
import express from "express";
import mongoose from "mongoose";
import cors from "cors"; // 跨域
import contactRoute from "./contact.js";
import authRoute from "./routes/auth.js";
import userRoute from "./routes/user.js";
import productRoute from "./routes/product.js";
import categoryRoute from "./routes/category.js";
import cartRoute from "./routes/cart.js";
import collectionRoute from "./routes/collection.js";

import "./config/passport.js";
import passport from "passport";
import session from "express-session";
import MongoStore from "connect-mongo"; // store session in database

const app = express();
const port = process.env.PORT || 8080;
const mongodb_connection = process.env.MONGODB_CONNECTION || "mongodb://127.0.0.1:27017/PORTFOLIO";

mongoose
  .connect(mongodb_connection)
  .then(() => {
    console.log("successfully connected database");
  })
  .catch((e) => {
    console.log(e);
  });

const ensureAuthenticated = (req, res, next) => {
  // 若使用者已通過驗證，則觸發 next()
  if (req.isAuthenticated()) {
    return next();
  }
  // 未通過驗證
  res.status(401).send({ message: "請先登入" });
};

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(
  cors({
    origin: (process.env.APP_URL || "http://localhost:3000").split(",").map((item) => item.trim()),
    // origin: process.env.APP_URL || "http://localhost:3000", // REACT
    credentials: true,
  })
);

if (process.env.NODE_ENV !== "development") {
  // 設定安全 cookie 時的反向代理（透過 X-Forwarded-Proto Header 識別）
  app.set("trust proxy", true);
}
app.use(
  session({
    secret: process.env.SESSION_SECRET,
    name: "session-cookie-id",
    resave: false,
    saveUninitialized: false,
    cookie: {
      httpOnly: process.env.NODE_ENV === "development" ? false : true,
      secure: process.env.NODE_ENV === "development" ? false : true,
      sameSite: process.env.NODE_ENV === "development" ? false : "none",
    },
    store: MongoStore.create({ mongoUrl: mongodb_connection }),
  })
);
// 確認 passport.user 是否已存在
app.use(passport.initialize());
// 處理 Session。若有找到 passport.user，則判定其通過驗證，並呼叫 deserializeUser()。
app.use(passport.session());

// http://localhost:8080/api/portfolio
app.use("/api/portfolio", contactRoute);

// http://localhost:8080/auth
app.use("/auth", authRoute);
app.use("/user", ensureAuthenticated, userRoute);
app.use("/products", productRoute);
app.use("/category", categoryRoute);
app.use("/cart", ensureAuthenticated, cartRoute);
app.use("/collection", ensureAuthenticated, collectionRoute);

app.listen(port, () => {
  console.log("server working on port " + port);
});
