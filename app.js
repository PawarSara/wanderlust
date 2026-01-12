if (process.env.NODE_ENV !== "production") {
  require("dotenv").config();
}

const express = require("express");

const { MongoStore } = require("connect-mongo");

const app = express();
const mongoose = require("mongoose");
const path = require("path");

// MODELS
const Listing = require("./models/listing.js");
const User = require("./models/user.js");

// ROUTES
const listingRouter = require("./routes/listing.js");
const reviewsRouter = require("./routes/review.js");
const userRouter = require("./routes/user.js");

const session = require("express-session");
const flash = require("connect-flash");
const passport = require("passport");
const LocalStrategy = require("passport-local");
const methodOverride = require("method-override");
const engine = require("ejs-mate");

const ExpressError = require("./utils/ExpressError.js");
const bookingRouter = require("./routes/booking");
const chatRouter = require("./routes/chat");

// -----------------------
// VIEW ENGINE + STATIC FILES
// -----------------------
app.engine("ejs", engine);
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

app.use(express.urlencoded({ extended: true }));
app.use(methodOverride("_method"));
app.use(express.static(path.join(__dirname, "public")));

// 🚫 Prevent caching of dynamic pages
app.use((req, res, next) => {
  res.set("Cache-Control", "no-store, no-cache, must-revalidate, private");
  res.set("Pragma", "no-cache");
  res.set("Expires", "0");
  next();
});

// -----------------------
// DATABASE CONNECTION
// -----------------------

const dbUrl = process.env.ATLASDB_URL;
console.log("⭐ DEBUG ATLASDB_URL =", JSON.stringify(process.env.ATLASDB_URL));
mongoose.connect(dbUrl)
  .then(() => console.log("✅ MongoDB Connected"))
  .catch(err => console.log("Mongo connection error:", err));

// -----------------------
// SESSION STORE (FIXED)
// -----------------------
const store = MongoStore.create({
  mongoUrl: dbUrl,
  crypto: {
      secret: "mysupersecretcode",
  },
  touchAfter: 24 * 3600,
});




// 🔧 FIX: err parameter added (CRASH FIX)
store.on("error", (err) => {
  console.log("ERROR IN MONGO SESSION STORE", err);
});

// -----------------------
// SESSION + FLASH
// -----------------------
const sessionOptions = {
  store,
  secret: "mysupersecretcode",
  resave: false,
  saveUninitialized: true,
  cookie: {
      httpOnly: true,
      maxAge: 7 * 24 * 60 * 60 * 1000
  }
};

app.use(session(sessionOptions));
app.use(flash());

// -----------------------
// PASSPORT CONFIG
// -----------------------
app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy({ usernameField: "email" }, User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

// -----------------------
// FLASH + CURRENT USER MIDDLEWARE
// -----------------------
app.use((req, res, next) => {
  res.locals.success = req.flash("success");
  res.locals.error = req.flash("error");
  res.locals.currUser = req.user;
  next();
});

// -----------------------------------------------------------
// ROOT ROUTE
// -----------------------------------------------------------
app.get("/", async (req, res, next) => {
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
      res.render("listings/index", { allListings, filter, search: search || "" });
  } catch (err) {
      next(err);
  }
});

// -----------------------
// ROUTES
// -----------------------
app.use("/listings", listingRouter);
app.use("/listings/:id/reviews", reviewsRouter);
app.use("/", userRouter);
app.use("/bookings", bookingRouter);
app.use("/chat", chatRouter);

// -----------------------
// MULTER ERROR HANDLER
// -----------------------
app.use((err, req, res, next) => {
  if (err.name === "MulterError") {
      console.log("Multer error:", err.message);
      req.flash("error", err.message);
      return res.redirect("back");
  }
  next(err);
});

// -----------------------
// 404 HANDLER
// -----------------------
app.use((req, res, next) => {
  next(new ExpressError(404, "Page not found"));
});

// -----------------------
// ERROR HANDLER
// -----------------------
app.use((err, req, res, next) => {
  if (res.headersSent) return next(err);
  const statusCode = err.statusCode || 500;
  const message = err.message || "Something went wrong!";
  res.status(statusCode).render("error", { status: statusCode, message });
});

// -----------------------
// SERVER (Render-safe FIX)
// -----------------------
const PORT = process.env.PORT || 8080; // 🔧 FIXED
app.listen(PORT, () => console.log(`Server listening on port ${PORT}`));
