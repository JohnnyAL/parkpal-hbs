const express = require("express");
const router = express.Router();
const Spot = require("../models/Spot");
const User = require("../models/User");
const geocoder = require("../utils/geocoder");

router.get("/list", (req, res) => {
  Spot.find()
    .then(spots => {
      res.render("parking-spots/list.hbs", {
        spots,
        spotDetail: JSON.stringify(spots),
        user: req.session.user
      });
    })
    .catch(err => {
      next(err);
    });
});

router.get("/filtered-query", (req, res, next) => {
  let longitude;
  let latitude;
  console.log("LOCATION", req.query.location);
  geocoder
    .geocode(req.query.location)
    .then(res => {
      let longitude = res[0].longitude;
      let latitude = res[0].latitude;
      // console.log("LONGITUDE", longitude, "LATITUDE", latitude);
      console.log("LONGITUDE", longitude, "LATITUDE", latitude);
      return { longitude, latitude };
    })
    .then(geoLocation => {
      console.log("GEOLOACTION", geoLocation);
      return Spot.find({
        $and: [
          {
            startTime: { $gte: req.query.startDate + " " + req.query.startTime }
          },
          { endTime: { $lte: req.query.endDate + " " + req.query.endTime } },
          {
            geoLocation: {
              $near: {
                $maxDistance: 200000,
                $geometry: {
                  type: "Point",
                  coordinates: [geoLocation.longitude, geoLocation.latitude]
                }
              }
            }
          }
        ]
      }).then(spots => {
        res.render("parking-spots/list.hbs", {
          spots,
          user: req.session.user
        });
      });
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
    description,
    streetAddress,
    city,
    state,
    zipCode,
    country,
    size,
    type,
    startDate,
    endDate,
    startTime,
    endTime,
    price
  } = req.body;

  let longitude;
  let latitude;

  geocoder
    .geocode(
      `${req.body.streetAddress}, ${req.body.city}, ${req.body.state} ${req.body.zipCode}, ${req.body.country}`
    )
    .then(res => {
      let longitude = res[0].longitude;
      let latitude = res[0].latitude;
      // console.log("LONGITUDE", longitude, "LATITUDE", latitude);
      return { longitude, latitude };
    })
    .then(geoLocation => {
      return Spot.create({
        name,
        description,
        streetAddress,
        city,
        state,
        zipCode,
        country,
        geoLocation: {
          type: "Point",
          coordinates: [geoLocation.longitude, geoLocation.latitude]
        },
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
          console.log(createdSpot);
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
        });
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
        spotDetail: JSON.stringify(spot),
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
    description,
    streetAddress,
    city,
    state,
    zipCode,
    country,
    size,
    type,
    startDate,
    endDate,
    startTime,
    endTime,
    price
  } = req.body;

  let longitude;
  let latitude;

  geocoder
    .geocode(
      `${req.body.streetAddress}, ${req.body.city}, ${req.body.state} ${req.body.zipCode}, ${req.body.country}`
    )
    .then(res => {
      let longitude = res[0].longitude;
      let latitude = res[0].latitude;
      // console.log("LONGITUDE", longitude, "LATITUDE", latitude);
      return { longitude, latitude };
    })
    .then(geoLocation => {
      return Spot.updateOne(
        { _id: req.params.id },
        {
          name,
          description,
          streetAddress,
          city,
          state,
          zipCode,
          country,
          geoLocation: geoLocation,
          size,
          type,
          startDate,
          endDate,
          startTime: startDate + " " + startTime,
          endTime: endDate + " " + endTime,
          price,
          owner: req.session.user._id
        }
      ).then(() => {
        res.redirect(`/parking-spots/detail/${req.params.id}`);
      });
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
