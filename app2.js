const express = require("express");
const app = express();
const path = require("path");
const userModel = require("./model/users");
const bcrypt = require("bcryptjs");
const passport = require("passport");
const LocalStrategy = require("passport-local").Strategy;
const plm = require("passport-local-mongoose");
const session = require("express-session");
const flash = require("connect-flash");

// Middleware Setup
app.use(express.urlencoded({ extended: true }));
app.use(session({
    secret: "secretkey",
    resave: false,
    saveUninitialized: true
}));
app.use(passport.initialize());
app.use(passport.session());
app.use(flash());

// Flash message middleware
app.use((req, res, next) => {
    res.locals.success_msg = req.flash("success_msg");
    res.locals.error_msg = req.flash("error_msg");
    next();
});

// Passport Configuration
passport.use(new LocalStrategy(userModel.authenticate()));
passport.serializeUser(userModel.serializeUser());
passport.deserializeUser(userModel.deserializeUser());

// Registration Route (Handled by /login)
app.post("/login", async (req, res) => {
    try {
        const { username, password } = req.body;
        let existingUser = await userModel.findOne({ username });
        if (existingUser) {
            req.flash("error_msg", "User already exists!");
            return res.redirect("/login");
        }
        let newUser = new userModel({ username });
        await userModel.register(newUser, password);
        req.flash("success_msg", "Registered successfully! Please login.");
        res.redirect("/loginreg");
    } catch (err) {
        console.log(err);
        req.flash("error_msg", "Something went wrong.");
        res.redirect("/login");
    }
});

// Login Route (Handled by /loginreg)
app.post("/loginreg", passport.authenticate("local", {
    failureRedirect: "/loginreg",
    failureFlash: true
}), (req, res) => {
    req.flash("success_msg", "Login successful!");
    res.redirect("/profile");
});

// Authentication Middleware
function isAuthenticated(req, res, next) {
    if (req.isAuthenticated()) {
        return next();
    }
    req.flash("error_msg", "Please log in first.");
    res.redirect("/loginreg");
}

// Profile Route
app.get("/profile", isAuthenticated, (req, res) => {
    res.render("profile", { user: req.user });
});

module.exports = app;
