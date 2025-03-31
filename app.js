const express = require("express");
const app = express();
const path = require("path");
const Review = require('./model/Review');
const { log } = require("console");
const bcrypt = require("bcryptjs");
// const bcrypt = require("bcrypt");
const passport = require("passport");
const LocalStrategy = require("passport-local").Strategy;
const plm = require("passport-local-mongoose");
var cookieParser = require("cookie-parser");
var bodyParser = require("body-parser");
var logger = require("morgan");
const expressSession = require("express-session");
const mongoose = require("mongoose");
const jwt = require("jsonwebtoken");


mongoose.connect(process.env.DB, {
  useNewUrlParser: true,
  useUnifiedTopology: true
}).then(() => {
  console.log("✅ MongoDB connected successfully!");
}).catch(err => {
  console.log("❌ MongoDB connection error:", err);
});

app.set("view engine", "ejs");
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(
  expressSession({
    resave: false,
    saveUninitiallized: false,
    secret: "hello",
  })
);


app.use(logger("dev"));
app.use(cookieParser());
app.use(express.static("public"));
app.use(express.static(path.join(__dirname, "public")));
app.set("trust proxy", true);


app.get("/", function (req, res) {
  res.redirect("/review");
});

app.get("/review", function (req, res) {
  console.log("redirecting to the review/feedback page");
  res.render("review");
});

app.get("/Reviewsumbit", function (req, res) {
  console.log("review submitted successfully");
  res.render("Reviewsumbit");
});

app.post("/review", async (req, res) => {
  try {
      const { name, number, childrenName, comment, rate, exp } = req.body;
      let ipAddress = req.headers["x-forwarded-for"] || req.connection.remoteAddress;
      if (ipAddress.includes(",")) {
          ipAddress = ipAddress.split(",")[0].trim();
      }

      const newReview = new Review({
          name,
          number,
          childrenName,
          comment,
          rate,
          exp,
          ipAddress
      });

      await newReview.save();
      res.render("Reviewsumbit");
      console.log(ipAddress);
  } catch (error) {
      console.error(error);
      res.status(500).send("Server error", err.message);
  }
});


app.listen(3000);