const express = require("express");
const app = express();
const path = require("path");
const userModel = require("./model/users");
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


mongoose.connect("mongodb+srv://anmol_60754:password_9900@cluster0.ndbuizv.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0", {
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
passport.use(new LocalStrategy(userModel.authenticate()));
app.use(passport.initialize());
app.use(passport.session());
passport.serializeUser(userModel.serializeUser());
passport.use(
  new LocalStrategy(
    {
      usernameField: "email", // Tell Passport to use "email" instead of "username"
      passwordField: "password",
    },
    userModel.authenticate()
  )
);

passport.deserializeUser(userModel.deserializeUser());

app.use(logger("dev"));
app.use(cookieParser());
app.use(express.static("public"));
app.use(express.static(path.join(__dirname, "public")));
app.set("trust proxy", true);


app.get("/", function (req, res) {
  console.log("On The Main Page ⬆ ⬆ ↕ ✔ ✔ ✔ ✔ ✔");
  // res.send("hello!");
  console.log("redirecting on loginreg page ⬆ ⬆");
  res.redirect("/review");
});

app.get("/login", function (req, res) {
  console.log("moving on the login page(regitering a new user)");
  res.render("login4");
});

app.get("/loginreg", function (req, res) {
  console.log("moving on the loginreg page(login a old user)");
  res.render("fb_login");
});

app.get("/profile", function (req, res) {
  console.log("redirecting to the main page");
  res.render("main", { user: req.user });
});

app.get("/review", function (req, res) {
  console.log("redirecting to the review/feedback page");
  res.render("review");
});

// app.get("/profile", function (req, res) {
//   res.render("main", { user: req.user });
// });

// app.post("/login", async function (req, res) {
//   try {
//     let { email, password } = req.body;

//     // bcrypt.gensalt(10, function(err, salt) {
//     //     console.log(password);
//     // bcrypt.hash(password, salt, async function(err) {
//     // });

//     // function hashing (){
//     //   bcrypt.hash(password, 10, (err, hash) => {
//     //     if (err) console.error(err);
//     //     else console.log(hash);
//     //   });
//     // };

//     // const hash = hashing();

//     let User = userModel.create({
//       email,
//       password,
//     });

//     res.send(User);

//     // User.save();

//     console.log("Login Successful");
//     res.redirect("profile");
//   } catch (err) {
//     console.log(err.message);
//   }

// // }); *******************

//   // let user = user.Model.create({
//   // email,
//   //   password: password
//   // });

//   // let user = user.Model.Create({
//   //   email,
//   //   password
//   // });
// });

// app.post("/loginreg", passport.authenticate("local", {
//   failureRedirect: "/",
//   successRedirect: "/profile",
// }), function (req, res, next) {
// });

// app.post("/loginreg", function (req, res, next) {
//   passport.authenticate("local", function (err, user, info) {
//     if (err) {
//       console.error("Authentication error:", err);
//       return res.redirect("/");
//     }
//     if (!user) {
//       console.log("Authentication failed:", info.message);
//       return res.redirect("/");
//     }
//     req.logIn(user, function (err) {
//       if (err) {
//         console.error("Login error:", err);
//         return res.redirect("/");
//       }
//       console.log("Authentication successful, redirecting to profile");
//       return res.redirect("/profile");
//     });
//   })(req, res, next);
// });

app.post("/login", async (req, res) => {
  try {
    let { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).send("❌ Email and password are required");
    }

    let newUser = new userModel({ username: email, email });

    await userModel.register(newUser, password); // This hashes the password

    console.log("✅ User registered successfully with this e-mail and password : ", email, password);
    res.redirect("/loginreg");
  } catch (err) {
    console.error("❌ Error registering user:", err);
    res.status(500).send("Registration failed: Email and password is incorrect");
  }
});

app.post("/loginreg", function (req, res, next) {
  console.log("Request Body:", req.body);
  passport.authenticate("local", function (err, user, info) {
    if (err) {
      console.error("Authentication error:", err);
      return res.redirect("/");
    }
    if (!user) {
      console.log("Authentication failed:", info.message);
      return res.redirect("/loginreg");
    }
    req.logIn(user, function (err) {
      if (err) {
        console.error("Login error:", err);
        return res.redirect("/");
      }
      console.log("Authentication successful, redirecting to profile");
      return res.redirect("/profile");
    });
  })(req, res, next);
});


// POST Route to Save Review Data
app.post("/review", async (req, res) => {
  try {
      const { name, number, childrenName, comment, rate, exp } = req.body;
      
      // Get real IP address
      let ipAddress = req.headers["x-forwarded-for"] || req.connection.remoteAddress;

      // If multiple IPs are forwarded, get the first one
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
      res.send("Review submitted successfully!");
      console.log(ipAddress);
  } catch (error) {
      console.error(error);
      res.status(500).send("Server error");
  }
});






app.get("/logout", function (req, res, next) {
  req.logout(function (err) {
    if (err) {
      return next(err);
    }
    res.redirect("/");
  });
});

function isLoggedIn(req, res, next) {
  if (req.isAuthenticated()) {
    return next;
  }
  res.redirect("/");
}

app.listen(3000);
