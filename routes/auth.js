const router = require("express").Router();

const mongoose = require("mongoose");

const bcrypt = require("bcryptjs");
const saltRounds = 10;

const Session = require("../models/Session.model");
const SESSION_EXPIRATION = 1000 * 60 * 30; //Sessions live for 30 minutes

const User = require("../models/User.model");



router.post("/signup", (req, res) => {
  const { username, password, isAdmin } = req.body;
  
  if (!username) {
    return res
      .status(400)
      .json({ errorMessage: "Please provide your username." });
  }
  
  const regex = /(?=.*\d)(?=.*[a-z])(?=.*[A-Z]).{8,}/;
  if (!password || !regex.test(password)) {
    return res.status(400).json({
      errorMessage:
        "Password needs to have at least 8 chars and must contain at least one number, one lowercase and one uppercase letter.",
    });
  }
  
  User.findOne({ username }).then((found) => {
    if (found) {
      return res
        .status(400)
        .json({ errorMessage: "Username already taken." });
    }
    else return bcrypt
      .genSalt(saltRounds)
      .then((salt) => bcrypt.hash(password, salt))
      .then((hashedPassword) => {
        return User.create({
          username,
          passhash: hashedPassword,
          isAdmin,
        });
      })
      .then((user) => {
        //TODO: send back user data for easy login (maybe password?)
        return res.status(201).json(user);
      })
      .catch((error) => {
        if (error instanceof mongoose.Error.ValidationError) {
          return res
            .status(400)
            .json({ errorMessage: error.message });
        }
        else if (error.code === 11000) {
          return res.status(400).json({
            errorMessage:
              "Username needs to be unique. The username you chose is already in use.",
          });
        }
        else return res
          .status(500)
          .json({ errorMessage: error.message });
      });
  });
});



router.post("/login", (req, res) => {
  const { username, password } = req.body;

  if (!username) {
    return res
      .status(400)
      .json({ errorMessage: "Please provide your username." });
  }

  User.findOne({ username }).then((user) => {
    if (!user) {
      return res
        .status(400)
        .json({ errorMessage: "Username not recognized." });
    }

    bcrypt.compare(password, user.password)
    .then((isSamePassword) => {
      if (!isSamePassword) {
        return res
          .status(400)
          .render("auth/login", { errorMessage: "Incorrect password." });
      }
      else return Session.create({user: user._id, expires: Date.now() + SESSION_EXPIRATION});
    })
    .then(session => {
      //TODO: send back something in addition to session?
      return res.status(201).json(session); 
    })
    .catch(error => res.status(500).json({ errorMessage: error.message }));
  });
});



router.post("/logout", (req, res) => {
  //TODO: determine a method to receive inbound session id
  const { id: session_id } = req.body;

  if (!session_id) {
    return res.status(400).json({ errorMessage: "Please provide a session id." });
  }
  else Session.findByIdAndDelete(session_id).then(session => {
    if (!session) return res.status(400).json({ errorMessage: "Invalid session id." });
    else return res.status(200).json(session);
  })
  .catch(error => res.status(500).json({ errorMessage: "Logout failed." }));
});


module.exports = router;
