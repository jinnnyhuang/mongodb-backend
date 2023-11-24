require("dotenv").config();
const express = require("express");
const app = express();
const mongoose = require("mongoose");
const cors = require("cors");
const contactRoute = require("./route");

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

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors());

app.use("/api/portfolio", contactRoute);
// http://localhost:8080/api/portfolio

app.listen(port, () => {
  console.log("server working on port " + port);
});
