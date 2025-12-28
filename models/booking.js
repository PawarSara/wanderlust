const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const bookingSchema = new Schema({
    listing: {
        type: Schema.Types.ObjectId,
        ref: "Listing",
        required: true
    },
    guest: {
        type: Schema.Types.ObjectId,
        ref: "User",
        required: true
    },
    host: {
        type: Schema.Types.ObjectId,
        ref: "User",
        required: true
    },
    checkIn: {
        type: Date,
        required: true
    },
    checkOut: {
        type: Date,
        required: true
    },
    guests: {
        type: Number,
        required: true
    },
    totalPrice: Number,
    status: {
        type: String,
        default: "pending" // pending, accepted, rejected
    },
    // 🆕 MESSAGES BETWEEN HOST & GUEST
    messages: [
        {
          sender:   { type: mongoose.Schema.Types.ObjectId, ref: "User" }, // host or guest
          text:     String,
          timestamp:{ type: Date, default: Date.now }
        }
      ]
    }, { timestamps: true });

module.exports = mongoose.model("Booking", bookingSchema);
