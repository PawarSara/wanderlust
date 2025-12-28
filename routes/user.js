const express = require("express");
const router = express.Router();
const passport = require("passport");
const users = require("../controllers/users");
const User = require("../models/user");
const Listing = require("../models/listing");
const { isLoggedIn } = require("../middleware");
const bookings = require("../controllers/bookings");


// -----------------------------
// REGISTER ROUTES
// -----------------------------
router
  .route("/signup")
  .get(users.renderRegister)
  .post(users.register);

// -----------------------------
// LOGIN ROUTES
// -----------------------------
router
  .route("/login")
  .get(users.renderLogin)
  .post((req, res, next) => {
    passport.authenticate("local", (err, user, info) => {
      if (err) return next(err);

      if (!user) {
        req.flash("error", "User not registered. Please sign up.");
        return res.redirect("/signup");
      }

      req.login(user, (err) => {
        if (err) return next(err);
        req.flash("success", "Welcome back!");

        const redirectUrl = req.session.returnTo || "/listings";
        delete req.session.returnTo;

        res.redirect(redirectUrl);
      });
    })(req, res, next);
  });

// -----------------------------
// LOGOUT ROUTE
// -----------------------------
router.get("/logout", users.logout);

// -----------------------------
// WISHLIST / FAVORITES TOGGLE
// -----------------------------
router.post("/favorites/:id", isLoggedIn, async (req, res) => {
  console.log("Wishlist route hit!");

  const listingId = req.params.id;
  const user = req.user;

  // Ensure favorites array exists
  if (!user.favorites) {
    user.favorites = [];
  }

  // Use string comparison because ObjectId !== string
  const favs = user.favorites.map(f => f.toString());
  const index = favs.indexOf(listingId.toString());

  if (index >= 0) {
    // remove
    user.favorites.splice(index, 1);
  } else {
    // add
    user.favorites.push(listingId);
  }

  await user.save();
  return res.redirect(req.get("referer") || "/listings");

});
// -----------------------------
// DASHBOARD ROUTE
// -----------------------------
router.get("/dashboard", isLoggedIn, users.renderDashboard);




module.exports = router;
