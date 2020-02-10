const express = require("express");
const router = express.Router();
const Spot = require("../models/Spot");
const User = require("../models/User");

router.get("/parking-spots", (req, res) => {
  Spot.find()
    .then(spots => {
      res.render("parking-spots/list.hbs", { spots, user: req.session.user });
    })
    .catch(err => {
      next(err);
    });
});

const loginCheck = (req, res, next) => {
  if (req.session.user) {
    next();
  } else {
    res.redirect("/");
  }
};

router.get("/add", loginCheck, (req, res) => {
  res.render("parking-spots/add.hbs", { user: req.session.user });
});

// router.get("/become-host", loginCheck, (req, res) => {
//   res.render("parking-spots/add.hbs", { role: req.session.user.role });
// });

router.post("/parking-spots", loginCheck, (req, res, next) => {
  const { name, address, description, size, type, price } = req.body;

  User.findById({ _id: req.session.user._id }).then(res => {
    console.log("hello", res);
  });

  Spot.create({
    name,
    address,
    description,
    size,
    type,
    price,
    owner: req.session.user._id
  })
    .then(() => {
      console.log(req.session.user._id);
      return User.findByIdAndUpdate(req.session.user._id, { role: "host" });
    })
    .then(() => {
      console.log("redirecttttt");
      res.redirect("parking-spots");
    })
    .catch(err => {
      next(err);
    });
});

module.exports = router;
