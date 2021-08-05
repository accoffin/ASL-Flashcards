const router = require("express").Router();

const mongoose = require("mongoose");

const bcrypt = require("bcryptjs");
const saltRounds = 10;

const Session = require("../models/Session.model");
const SESSION_EXPIRATION = 1000 * 60 * 30; //Sessions live for 30 minutes

const User = require("../models/User.model");

const ERRORS = require("../errors/auth.errors");

router.post("/signup", async (req, res) => {
  const { username, password, isAdmin } = req.body;

  if (!username) {
    return res.status(400).json(ERRORS.SIGNUP.MISSING_USERNAME);
  }

  const regex = /(?=.*\d)(?=.*[a-z])(?=.*[A-Z]).{8,}/;
  if (!password || !regex.test(password)) {
    return res.status(400).json(ERRORS.SIGNUP.INVALID_PASSWORD);
  }

  User.findOne({ username }).then((found) => {
    if (found) {
      return res.status(400).json(ERRORS.SIGNUP.ALREADY_REGISTERED);
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
            return res.status(400).json(ERRORS.SIGNUP.ALREADY_REGISTERED);
          } else return res.status(500).json({ errorMessage: error.message });
        });
  });
});

router.post("/login", (req, res) => {
  const { username, password } = req.body;

  if (!username) {
    return res
      .status(400)
      .json(ERRORS.LOGIN.MISSING_USERNAME);
  } else {
    User.findOne({ username: username }).then((user) => {
      if (!user) {
        return res
          .status(400)
          .json(ERRORS.LOGIN.USER_NOT_FOUND);
      }

      bcrypt.compare(password, user.passhash).then((isSamePassword) => {
        if (!isSamePassword) {
          return res.status(400).json(ERRORS.LOGIN.INCORRECT_PASSWORD);
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
  Session.findOne({user: user._id}).then(session => {
    if(!session) {
      Session.create({ user: user._id, expires: Date.now() + SESSION_EXPIRATION })
        .then((newSession) => {
          // console.log("Session created:", newSession);
          return res.status(201).json({ session: newSession, user: user });
        })
        .catch((error) => {
          console.log(error);
          return res
            .status(500)
            .json({ errorMessage: "Login failed", error: error });
        });
    } else {
      session.expires = Date.now() + SESSION_EXPIRATION;
      session.save()
        .then(_ => res.status(201).json({ session: session, user: user }))
        .catch((error) => {
          console.log(error);
          return res
            .status(500)
            .json({ errorMessage: "Login failed", error: error });
        });
    }
  });

}

module.exports = router;
