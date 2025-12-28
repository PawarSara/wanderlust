// middleware.js
const ExpressError = require("./utils/ExpressError.js");
const { listingSchema, reviewSchema } = require("./schema.js");
const Listing = require("./models/listing.js");
const Review = require("./models/review.js");

// ✅ Check if user is logged in
module.exports.isLoggedIn = (req, res, next) => {
  if (!req.isAuthenticated()) {
    req.session.redirectUrl = req.originalUrl;
    req.flash("error", "You must be logged in first!");
    // keep redirect here because it is an immediate control flow
    return res.redirect("/login");
  }
  return next();
};

// ✅ Check if logged-in user owns the listing
module.exports.isOwner = async (req, res, next) => {
  try {
    const { id } = req.params;
    const listing = await Listing.findById(id);
    if (!listing) {
      throw new ExpressError(404, "Listing not found");
    }
    if (!listing.owner.equals(req.user._id)) {
      throw new ExpressError(403, "You don't have permission to do that!");
    }
    return next();
  } catch (err) {
    return next(err);
  }
};

// ✅ Validate listing data (throws on error — do NOT redirect here)
module.exports.validateListing = (req, res, next) => {
  // Make sure req.body.listing exists
  if (!req.body.listing) {
    return res.status(400).render("listings/new", {
      listing: {},
      error: "Listing data is required",
    });
  }

  // Normalize features to always be an array
  if (req.body.listing.features && !Array.isArray(req.body.listing.features)) {
    req.body.listing.features = [req.body.listing.features];
  } else if (!req.body.listing.features) {
    req.body.listing.features = [];
  }

  // Validate using Joi
  const { error } = listingSchema.validate({ listing: req.body.listing });

  if (error) {
    const msg = error.details.map(el => el.message).join(", ");
    return res.status(400).render("listings/new", {
      listing: req.body.listing,
      error: msg,
    });
  }

  // Pass validated listing to next middleware
  next();
};



// Validate review data
module.exports.validateReview = (req, res, next) => {
  try {
    if (!req.body.review) {
      throw new ExpressError(400, "Review data is required");
    }

    const { error } = reviewSchema.validate({ review: req.body.review });
    if (error) {
      const msg = error.details.map(el => el.message).join(", ");
      throw new ExpressError(400, msg);
    }

    return next();
  } catch (err) {
    return next(err);
  }
};


// ✅ Check if logged-in user owns the review
module.exports.isReviewAuthor = async (req, res, next) => {
  try {
    const { id, reviewId } = req.params;
    const review = await Review.findById(reviewId);
    if (!review) {
      throw new ExpressError(404, "Review not found");
    }
    if (!review.author.equals(req.user._id)) {
      throw new ExpressError(403, "You do not have permission to do that!");
    }
    return next();
  } catch (err) {
    return next(err);
  }
};
const Booking = require("./models/booking");

module.exports.isHost = async (req, res, next) => {
  const booking = await Booking.findById(req.params.id);

  if (!booking || booking.host.toString() !== req.user._id.toString()) {
      req.flash("error", "You do not have permission to do that");
      return res.redirect("/dashboard");   // ✅ FIXED
  }

  next();
};