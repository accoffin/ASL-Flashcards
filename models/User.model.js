const mongoose = require("mongoose");
const bcryptjs = require("bcryptjs");
const { Schema, model } = require("mongoose");

// TODO: Please make sure you edit the user model to whatever makes sense in this case
const userSchema = new Schema({
  username: {
    type: String,
    unique: true,
  },
  password: String,
  isAdmin: { type: String, default: false }, //if 'true' user will have access to flashcard.create page.
  decks: [{ type: Schema.Types.ObjectId, ref: "Deck" }],
});

userSchema.pre("save", function (next) {
  // ENCRYPT PASSWORD
  const user = this;
  if (!user.isModified("password")) {
    return next();
  }
  bcryptjs.genSalt(10, (err, salt) => {
    bcryptjs.hash(user.password, salt, (err, hash) => {
      user.password = hash;
      next();
    });
  });
});

// Now make a function to enable this.password to work.
userSchema.methods.comparePassword = function (password, done) {
  bcrypt.compareSync(password, this.password, (err, isMatch) => {
    done(err, isMatch);
  });
};

const User = model("User", userSchema);

module.exports = User;
