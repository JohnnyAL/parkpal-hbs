const express = require("express");
const router = express.Router();

/* GET home page */
router.get("/", (req, res, next) => {
  console.log({ user: req.session.user });
  res.render("index", { user: req.session.user });
});

module.exports = router;
