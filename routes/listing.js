const express = require("express");
const router = express.Router();
const wrapAsync = require("../utils/wrapAsync.js");
const listingController = require("../controllers/listings.js");
const { isLoggedIn, isOwner, validateListing } = require("../middleware.js");
const multer = require("multer");
const { storage } = require("../cloudConfig.js");

const upload = multer({ storage });

// ---------------------
// NEW FORM
// ---------------------
router.get("/new", isLoggedIn, listingController.renderNewForm);

// ---------------------
// INDEX + CREATE
// ---------------------
router
  .route("/")
  .get(wrapAsync(listingController.index))
  .post(
    isLoggedIn,
    upload.single("image"),  // ✅ match input name
    validateListing,
    wrapAsync(listingController.createListing)
  );


// ---------------------
// SHOW + UPDATE + DELETE
// ---------------------
router
  .route("/:id")
  .get(wrapAsync(listingController.showListing))
  .put(
    isLoggedIn,
    isOwner,
    upload.fields([{ name: "image", maxCount: 1 }]),
    validateListing,
    wrapAsync(listingController.updateListing)
  )
  .delete(isLoggedIn, isOwner, wrapAsync(listingController.deleteListing));

// ---------------------
// EDIT FORM
// ---------------------
router.get("/:id/edit", isLoggedIn, isOwner, wrapAsync(listingController.renderEditForm));

module.exports = router;
