// models/chat.js
const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const messageSchema = new Schema({
  sender: {
    type: Schema.Types.ObjectId,
    ref: "User",
    required: true
  },
  text: {
    type: String,
    required: true
  },
  timestamp: {
    type: Date,
    default: Date.now
  }
});

const chatSchema = new Schema(
  {
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

    messages: [messageSchema],

    // 🔔 unread counters
    unreadForHost: {
      type: Number,
      default: 0
    },
    unreadForGuest: {
      type: Number,
      default: 0
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model("Chat", chatSchema);
