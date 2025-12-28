const User = require("../models/user");
const Listing = require("../models/listing");
const Booking = require("../models/booking");   // ⭐ Add this
const Chat = require("../models/chat");         // ⭐ Add this

// Show register form
module.exports.renderRegister = (req, res) => {
    res.render("users/signup");
};

// Handle registration
module.exports.register = async (req, res, next) => {
    try {
        const { email, username, password } = req.body;
        const user = new User({ email, username });
        const registeredUser = await User.register(user, password);

        req.login(registeredUser, (err) => {
            if (err) return next(err);
            req.flash("success", "Welcome to Wanderlust!");
            res.redirect("/listings");
        });
    } catch (e) {
        req.flash("error", e.message);
        res.redirect("/register");
    }
};

// Show login form
module.exports.renderLogin = (req, res) => {
    res.render("users/login");
};

// Handle login
module.exports.login = (req, res) => {
    if (!req.user) {
        req.flash("error", "User not registered. Please sign up.");
        return res.redirect("/register");
    }
    req.flash("success", "Welcome back!");
    const redirectUrl = req.session.returnTo || "/listings";
    delete req.session.returnTo;
    res.redirect(redirectUrl);
};

// Logout
module.exports.logout = (req, res, next) => {
    req.logout(function (err) {
        if (err) return next(err);
        req.flash("success", "Goodbye!");
        res.redirect("/listings");
    });
};
// ===================== DASHBOARD =====================
// ===================== DASHBOARD =====================
module.exports.renderDashboard = async (req, res) => {

  const userId = req.user._id;

  // ⭐ User's saved stays
  const favorites = await Listing.find({
    _id: { $in: req.user.favorites || [] }
  });

  // ⭐ User's own listings (as Host)
  const myListings = await Listing.find({ owner: userId });

  // ⭐ BOOKINGS where the user is HOST
  const hostBookings = await Booking.find({ host: userId })
    .populate("listing")
    .populate("guest")
    .populate("messages.sender");

  // ⭐ BOOKINGS where the user is GUEST
  const myTrips = await Booking.find({ guest: userId })
    .populate("listing")
    .populate("host")
    .populate("messages.sender");

  // ⭐ INQUIRY CHATS where the user is host
  const inquiryChats = await Chat.find({ host: userId })
    .populate("listing")
    .populate("guest")
    .populate("messages.sender");

  // Render dashboard with new inquiryChats variable
  res.render("users/dashboard", {
    user: req.user,
    favorites,
    myListings,
    hostBookings,
    myTrips,
    inquiryChats   // ⭐ ADD THIS
  });
};
