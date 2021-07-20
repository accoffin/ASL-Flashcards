const router = require("express").Router();

const authRoutes = require("./auth.routes");


router.get("/", (req, res, next) => {
  res.status(200).send("👋 ASL Flashcards Backend is live");
});

router.use("/auth", authRoutes);

//add routes for other models here

module.exports = router;