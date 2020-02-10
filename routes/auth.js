const express = require("express");
const router = express.Router();
const User = require("../models/User");

// Bcrypt to encrypt passwords
const bcrypt = require("bcrypt");
const bcryptSalt = 10;

router.get("/signup", (req, res, next) => {
  res.render("auth/signup");
});

router.get("/become-host", (req, res, next) => {
  res.render("auth/signup", { host: true });
});

router.post("/signup", (req, res, next) => {
  let username = req.body.username;
  let password = req.body.password;
  let role;
  if (req.body.host) {
    role = "host";
  } else {
    role = "basic";
  }

  if (!username) {
    res.render("auth/signup", { errorMessage: "Please enter username" });
    return;
  }
  if (password.length < 6) {
    res.render("auth/signup", {
      errorMessage: "Password must be at least 6 characters"
    });
    return;
  }

  User.findOne({ username: username })
    .then(user => {
      if (user) {
        res.render("auth/signup", {
          errorMessage: "Username already taken. Please try again"
        });
        return;
      }

      bcrypt
        .hash(password, 10)
        .then(hash => {
          return User.create({
            username: username,
            password: hash,
            role: role
          });
        })
        .then(createdUser => {
          console.log(createdUser);

          req.session.user = createdUser;
          res.redirect("/");
        });
    })
    .catch(err => {
      next(err);
    });
});

router.get("/login", (req, res, next) => {
  res.render("auth/login");
});

router.post("/login", (req, res, next) => {
  let username = req.body.username;
  let password = req.body.password;

  let user;

  User.findOne({ username: username })
    .then(foundUser => {
      if (!foundUser) {
        res.render("auth/login", { errorMessage: "Invalid Credentials" });
        return;
      }

      user = foundUser;

      return bcrypt.compare(password, foundUser.password);
    })
    .then(match => {
      if (!match) {
        res.render("auth/login", { errorMessage: "Invalid Credentials" });
        return;
      }

      req.session.user = user;
      res.redirect("/");
    });
});

router.get("/logout", (req, res, next) => {
  req.session.destroy(err => {
    if (err) next(err);
    res.redirect("/");
  });
});

module.exports = router;
