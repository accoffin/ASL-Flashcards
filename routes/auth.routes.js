const router = require("express").Router();

const mongoose = require("mongoose");

const bcrypt = require("bcryptjs");
const saltRounds = 10;

const Session = require("../models/Session.model");
const SESSION_EXPIRATION = 1000 * 60 * 30; //Sessions live for 30 minutes

const User = require("../models/User.model");

router.post("/signup", async (req, res) => {
  if (req.headers?.authorization) {
    return res.status(403).json({ errorMessage: "You are already logged in." });
  }
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
      return res.status(400).json({ errorMessage: "Username already taken." });
    } else
      return bcrypt
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
          // console.log("User created:", user);
          login(res, user);
        })
        .catch((error) => {
          if (error instanceof mongoose.Error.ValidationError) {
            return res.status(400).json({ errorMessage: error.message });
          } else if (error.code === 11000) {
            return res.status(400).json({
              errorMessage:
                "Username needs to be unique. The username you chose is already in use.",
            });
          } else return res.status(500).json({ errorMessage: error.message });
        });
  });
});

router.post("/login", (req, res) => {
  if (req.headers?.authorization) {
    return res.status(403).json({ errorMessage: "You are already logged in." });
  }
  const { username, password } = req.body;

  if (!username) {
    return res
      .status(400)
      .json({ errorMessage: "Please provide your username." });
  } else {
    User.findOne({ username: username }).then((user) => {
      if (!user) {
        return res
          .status(400)
          .json({ errorMessage: "Username not recognized." });
      }

      bcrypt.compare(password, user.passhash).then((isSamePassword) => {
        if (!isSamePassword) {
          return res.status(400).json({ errorMessage: "Incorrect password." });
        } else login(res, user);
      });
    });
  }
});

router.post("/logout", (req, res) => {
  if (!req.headers?.authorization) {
    return res.status(403).json({ errorMessage: "You are not logged in." });
  } else
    Session.findByIdAndDelete(req.headers.authorization)
      .then((_) => {
        return res
          .status(200)
          .json({ message: "You have successfully logged out" });
      })
      .catch((error) =>
        res.status(500).json({ errorMessage: "Logout failed.", error: error })
      );
});

function login(res, user) {
  Session.create({ user: user._id, expires: Date.now() + SESSION_EXPIRATION })
    .then((session) => {
      // console.log("Session created:", session);
      return res.status(201).json({ session: session, user: user });
    })
    .catch((error) => {
      console.log(error);
      return res
        .status(500)
        .json({ errorMessage: "Login failed", error: error });
    });
}

module.exports = router;
