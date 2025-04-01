// const mongoose = require('mongoose');
// const plm = require("passport-local-mongoose");

// mongoose.connect("mongodb://localhost:27017/new");

// // """""""""""""""""""// const userSchema = mongoose.Schema({
// // // email: email,
// // // password: string
// // // });"""""""""""""""""""

// const userSchema = mongoose.Schema({
// email: String,
// password: String,
// });

// userSchema.plugin(plm);


// module.exports = mongoose.model('User', userSchema);




const mongoose = require("mongoose");
const passportLocalMongoose = require("passport-local-mongoose");

const userSchema = new mongoose.Schema({
  username: { type: String, unique: true, required: true }, // Passport requires this
  email: { type: String, unique: true, required: true }
});

userSchema.plugin(passportLocalMongoose); // Adds username/password authentication

module.exports = mongoose.model("User", userSchema);
