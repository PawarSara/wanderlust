const Listing = require("../models/listing.js");
const ExpressError = require("../utils/ExpressError.js");
const axios = require("axios");
const Booking = require("../models/booking");
const Chat = require("../models/chat");   // ⭐ ADD THIS

// ------------------------------------------------------
// GEOCODING HELPER
// ------------------------------------------------------
async function geocodeLocation(location) {
  try {
    const url = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(location)}`;
    const res = await axios.get(url);

    if (!res.data || res.data.length === 0) {
      throw new ExpressError(400, "Invalid location — Could not geocode");
    }

    return {
      lat: parseFloat(res.data[0].lat),
      lng: parseFloat(res.data[0].lon),
    };
  } catch (err) {
    throw new ExpressError(400, "Geocoding service failed");
  }
}

// ------------------------------------------------------
// INDEX
// ------------------------------------------------------
module.exports.index = async (req, res) => {
  try {
    const { search, filter } = req.query;
    let query = {};

    if (search) {
      query.$or = [
        { title: { $regex: search, $options: "i" } },
        { location: { $regex: search, $options: "i" } },
        { country: { $regex: search, $options: "i" } }
      ];
    }

    if (filter) {
      query.features = filter;
    }

    const allListings = await Listing.find(query);

    res.render("listings/index", {
      allListings,
      filter: filter || "",
      search: search || ""
    });
  } catch (err) {
    console.log(err);
    req.flash("error", "Cannot fetch listings right now.");
    res.redirect("/");
  }
};

// ------------------------------------------------------
// SHOW LISTING (UPDATED!!!)
// ------------------------------------------------------
module.exports.showListing = async (req, res, next) => {
  try {
    const listing = await Listing.findById(req.params.id)
      .populate("owner")
      .populate("reviews");

    if (!listing) {
      req.flash("error", "Listing not found");
      return res.redirect("/listings");
    }

    // ⭐ Increase views count
    listing.views = (listing.views || 0) + 1;
    await listing.save();

    let myBookingForThisListing = null;
    let existingChat = null;     // ⭐ IMPORTANT

    if (req.user) {
      // ⭐ Check booking existence
      myBookingForThisListing = await Booking.findOne({
        listing: listing._id,
        guest: req.user._id
      });

      // ⭐ Check if chat already exists
      existingChat = await Chat.findOne({
        listing: listing._id,
        guest: req.user._id
      });
    }

    return res.render("listings/show", {
      listing,
      currUser: req.user,
      myBookingForThisListing,
      existingChat     // ⭐ PASS TO EJS
    });

  } catch (err) {
    return next(err);
  }
};

// ------------------------------------------------------
// NEW FORM
// ------------------------------------------------------
module.exports.renderNewForm = (req, res) => {
  return res.render("listings/new", { listing: {} });
};

// ------------------------------------------------------
// CREATE LISTING
// ------------------------------------------------------
module.exports.createListing = async (req, res, next) => {
  try {
    const listingData = req.body.listing;

    if (req.file) {
      listingData.image = {
        url: req.file.path,
        filename: req.file.filename,
      };
    } else {
      listingData.image = {
        url: "https://rfq.africa/wp-content/uploads/2025/03/no-image.jpg",
        filename: "",
      };
    }

    // Geocode
    let geo = { lat: 20.5937, lng: 78.9629 };
    try {
      geo = await geocodeLocation(listingData.location);
    } catch (err) {
      req.flash("error", "Could not geocode location, using default coordinates");
    }

    listingData.geometry = {
      type: "Point",
      coordinates: [geo.lng, geo.lat],
    };

    listingData.owner = req.user._id;

    const newListing = new Listing(listingData);
    await newListing.save();

    req.flash("success", "Listing created successfully");
    return res.redirect(`/listings/${newListing._id}`);
  } catch (err) {
    return next(err);
  }
};

// ------------------------------------------------------
// EDIT FORM
// ------------------------------------------------------
module.exports.renderEditForm = async (req, res, next) => {
  try {
    const listing = await Listing.findById(req.params.id);
    if (!listing) {
      req.flash("error", "Listing not found");
      return res.redirect("/listings");
    }
    return res.render("listings/edit", { listing });
  } catch (err) {
    return next(err);
  }
};

// ------------------------------------------------------
// UPDATE LISTING
// ------------------------------------------------------
module.exports.updateListing = async (req, res, next) => {
  try {
    const { id } = req.params;
    const listingData = req.body.listing;

    if (req.files && req.files.image && req.files.image[0]) {
      listingData.image = {
        url: req.files.image[0].path,
        filename: req.files.image[0].filename,
      };
    }

    const updatedListing = await Listing.findByIdAndUpdate(id, listingData, {
      new: true,
      runValidators: true,
    });

    if (!updatedListing) {
      req.flash("error", "Listing not found");
      return res.redirect("/listings");
    }

    req.flash("success", "Listing updated successfully");
    return res.redirect(`/listings/${updatedListing._id}`);
  } catch (err) {
    return res.status(400).render("listings/edit", {
      listing: { ...req.body.listing, _id: req.params.id },
      error: err.message,
    });
  }
};

// ------------------------------------------------------
// DELETE LISTING
// ------------------------------------------------------
module.exports.deleteListing = async (req, res, next) => {
  try {
    const { id } = req.params;
    const deleted = await Listing.findByIdAndDelete(id);

    if (!deleted) {
      req.flash("error", "Listing not found");
      return res.redirect("/listings");
    }

    req.flash("success", "Listing deleted successfully");
    return res.redirect("/listings");
  } catch (err) {
    return next(err);
  }
};
