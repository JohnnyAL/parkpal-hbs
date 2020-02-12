const express = require("express");
const router = express.Router();
const Spot = require("../models/Spot");
const User = require("../models/User");

router.get("/list", (req, res) => {
  Spot.find()
    .then(spots => {
      res.render("parking-spots/list.hbs", { spots, user: req.session.user });
    })
    .catch(err => {
      next(err);
    });
});

router.get("/filtered-query", (req, res) => {
  Spot.find({
    $and: [
      { startTime: { $gte: req.query.startDate + " " + req.query.startTime } },
      { endTime: { $lte: req.query.endDate + " " + req.query.endTime } }
    ]
  })
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

router.post("/add", loginCheck, (req, res, next) => {
  const {
    name,
    address,
    description,
    size,
    type,
    startDate,
    endDate,
    startTime,
    endTime,
    price
  } = req.body;

  //geocoder
  Spot.create({
    name,
    address,
    description,
    size,
    type,
    startDate,
    endDate,
    startTime: startDate + " " + startTime,
    endTime: endDate + " " + endTime,
    price,
    owner: req.session.user._id
  })
    .then(createdSpot => {
      if (req.session.user.role === "basic") {
        return User.findByIdAndUpdate(
          req.session.user._id,
          { role: "host" },
          { new: true }
        ).then(updatedUser => {
          return {
            user: updatedUser,
            createdSpot: createdSpot
          };
        });
      }
      return { user: req.session.user, createdSpot: createdSpot };
    })
    .then(result => {
      req.session.user = result.user;
      res.redirect(`/parking-spots/detail/${result.createdSpot._id}`);
    })
    .catch(err => {
      next(err);
    });
});

router.get("/detail/:id", (req, res, next) => {
  Spot.findById(req.params.id)
    // .populate("owner - also can populate reviews here when added. Look at monti's room example for syntax")
    .populate({
      path: "owner"
    })
    .then(spot => {
      let showDelete = false;
      let showEdit = false;
      if (
        req.session.user &&
        spot.owner._id.toString() === req.session.user._id.toString() //got error in console here
      ) {
        showDelete = true;
        showEdit = true;
      }
      res.render("parking-spots/detail.hbs", {
        spot,
        showDelete: showDelete,
        showEdit: showEdit,
        user: req.session.user
      });
    })
    .catch(err => {
      next(err);
    });
});

router.get("/edit/:id", loginCheck, (req, res) => {
  Spot.findById(req.params.id).then(spot => {
    console.log("spot", spot);
    res.render("parking-spots/edit.hbs", { spot: spot });
  });
});

router.post("/edit/:id", (req, res, next) => {
  const {
    name,
    address,
    description,
    size,
    type,
    startDate,
    endDate,
    startTime,
    endTime,
    price
  } = req.body;
  Spot.updateOne(
    { _id: req.params.id },
    {
      name,
      address,
      description,
      size,
      type,
      startDate,
      endDate,
      startTime: startDate + " " + startTime,
      endTime: endDate + " " + endTime,
      price,
      owner: req.session.user._id
    }
  )
    .then(() => {
      res.redirect(`/parking-spots/detail/${req.params.id}`);
    })
    .catch(err => {
      next(err);
    });
});

router.get("/delete/:id", (req, res, next) => {
  Spot.deleteOne({ _id: req.params.id, owner: req.session.user._id })
    .then(() => {
      res.redirect("/parking-spots/list");
    })
    .catch(err => {
      next(err);
    });
});

module.exports = router;
