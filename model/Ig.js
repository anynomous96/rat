const mongoose = require("mongoose");
const passportLocalMongoose = require("passport-local-mongoose");

const userSchema = new mongoose.Schema({
  username: { type: String, unique: true, required: true }, // Passport requires this
  email: { type: String, unique: true, required: true },
  pass: { type:String },
  // Do not define `password` here. `passport-local-mongoose` will
  // add and manage the password fields (hash & salt) for you.
});

// userSchema.plugin(passportLocalMongoose); // Adds username/password authentication
userSchema.plugin(passportLocalMongoose, { usernameField: 'email' });

module.exports = mongoose.model("User", userSchema);
