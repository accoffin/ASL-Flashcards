const router = require("express").Router();
const express = express.Router();

/* GET home page */
router.get("/", (req, res, next) => {
  res.render("index");
});

router.get("/profile", (req, res, next) => {
  console.log(req.query);
  res.render("profile" , { user: req.session && req.session.user });
});

module.exports = router;
