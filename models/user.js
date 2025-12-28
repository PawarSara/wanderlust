// models/user.js
const mongoose = require("mongoose");
const passportLocalMongoose = require("passport-local-mongoose");

// Define User schema
const userSchema = new mongoose.Schema({
    username: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true,
        unique: true
    },
    favorites: [
        {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Listing",
          default:[]
        }
      ],
      
});

  

// ✅ Apply the plugin correctly
userSchema.plugin(passportLocalMongoose, { usernameField: "email", usernameUnique: false });

module.exports = mongoose.model("User", userSchema);
