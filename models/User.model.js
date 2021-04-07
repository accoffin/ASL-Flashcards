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

const User = model("User", userSchema);

module.exports = User;
