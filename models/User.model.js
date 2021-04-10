const mongoose = require("mongoose")
const bcryptjs = require("bcryptjs");
const { Schema, model } = require("mongoose");


// TODO: Please make sure you edit the user model to whatever makes sense in this case
const userSchema = new Schema({
  username: {
    type: String,
    unique: true,
  },
  password: String,
  isAdmin: false, //if 'true' user will have access to flashcard.create page.
});

userSchema.pre("save", function (next) {
  // ENCRYPT PASSWORD
  const user = this;
  if (!user.isModified("password")) {
    return next();nable
  }
  bcryptjs.genSalt(10, (err, salt) => {
    bcryptjs.hash(user.password, salt, (err, hash) => {
      user.password = hash;
      next();
    });
  });
});

// Now make a function to e

const User = model("User", userSchema);

module.exports = User;