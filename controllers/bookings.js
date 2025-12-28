const Booking = require("../models/booking");
const Listing = require("../models/listing");
const User = require("../models/user");


module.exports.createBooking = async (req, res) => {
    const { id } = req.params;

    const listing = await Listing.findById(id);
    if (!listing) {
        req.flash("error", "Listing not found");
        return res.redirect("/listings");
    }

    const { checkIn, checkOut, guests, message } = req.body;

    // calculate nights
    const nights = (new Date(checkOut) - new Date(checkIn)) / (1000 * 60 * 60 * 24);
    const totalPrice = nights * listing.price;

    // Create booking
    const booking = new Booking({
        listing: listing._id,
        host: listing.owner,
        guest: req.user._id,
        checkIn,
        checkOut,
        guests,
        totalPrice,
        status: "pending",
        messages: []            // ensure array exists
    });

    // ⭐ Save first guest message if provided
    if (message && message.trim() !== "") {
        booking.messages.push({
            sender: req.user._id,    // ⭐ FIX — save User ID
            text: message.trim(),
            date: new Date()
        });
    }

    await booking.save();
    req.flash("success", "Booking request sent!");
    res.redirect("/dashboard");
};
// ========================================
// DASHBOARD → Host Requests + User Trips + Favorites + Listings
// ========================================
module.exports.dashboard = async (req, res) => {

    // Bookings where the logged user is *HOST*
    const hostBookings = await Booking.find({ host: req.user._id })
        .populate("listing")
        .populate("guest");

    // Bookings where the logged user is *GUEST*
    const myTrips = await Booking.find({ guest: req.user._id })
        .populate("listing")
        .populate("host");

    // All saved listings
    const favorites = await Listing.find({
        _id: { $in: req.user.favorites }
    });

    // Listings created by the logged user
    const myListings = await Listing.find({
        owner: req.user._id
    });

    res.render("users/dashboard", {
        user: req.user,
        favorites,
        myListings,
        hostBookings,
        myTrips
    });
};



// ========================================
// ACCEPT BOOKING
// ========================================
module.exports.acceptBooking = async (req, res) => {
    await Booking.findByIdAndUpdate(req.params.id, { status: "Accepted" });

    req.flash("success", "Booking accepted!");
    return res.redirect("/dashboard");
};



// ========================================
// REJECT BOOKING
// ========================================
module.exports.rejectBooking = async (req, res) => {
    await Booking.findByIdAndUpdate(req.params.id, { status: "Rejected" });

    req.flash("error", "Booking rejected");
    return res.redirect("/dashboard");
};
module.exports.sendMessage = async (req, res) => {
    const { id } = req.params;
    const { message } = req.body;
  
    const booking = await Booking.findById(id);
  
    if (!booking) {
      req.flash("error", "Booking not found");
      return res.redirect("/dashboard");
    }
  
    // ✅ Only host or guest of this booking can send messages
    const isHost  = booking.host.toString() === req.user._id.toString();
    const isGuest = booking.guest.toString() === req.user._id.toString();
  
    if (!isHost && !isGuest) {
      req.flash("error", "You are not allowed to message on this booking");
      return res.redirect("/dashboard");
    }
  
    // push new message
    booking.messages.push({
      sender: req.user._id,
      text: message
    });
  
    await booking.save();
  
    req.flash("success", "Message sent!");
    res.redirect("/dashboard");
  };