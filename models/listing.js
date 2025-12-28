const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const Review = require("./review.js");

const ImageSchema = new Schema({
    url: String,
    filename: String
});

// Optional: Virtual for changing image size
ImageSchema.virtual("thumbnail").get(function () {
    return this.url.replace("/upload", "/upload/w_250");
});

const listingSchema = new Schema({
    title: {
        type: String,
        required: true
    },
    description: {
        type: String,
        required: true
    },

    // ⭐ UPDATED FOR CLOUDINARY
    image: {
        url: {
            type: String,
            required: true,
            default: "https://rfq.africa/wp-content/uploads/2025/03/no-image.jpg"
        },
        filename: {
            type: String,
            default: ""
        }
    },

    price: {
        type: Number,
        required: true
    },
    location: {
        type: String,
        required: true
    },
    country: {
        type: String,
        required: true
    },

    reviews: [
        {
            type: Schema.Types.ObjectId,
            ref: "Review"
        }
    ],

    owner: {
        type: Schema.Types.ObjectId,
        ref: "User"
    },
    geometry: {
        type: {
            type: String,
            enum: ["Point"],
            required: true,
            default: "Point"
        },
        coordinates: {
            type: [Number], // [longitude, latitude]
            required: true
        }
    },
    features: {
        type: [String],
        default: []
      },
      views: {
        type: Number,
        default: 0
      }
      
      
    
});

// ⭐ Delete reviews when listing is deleted
listingSchema.post("findOneAndDelete", async (listing) => {
    if (listing) {
        await Review.deleteMany({ _id: { $in: listing.reviews } });
    }
});

const Listing = mongoose.model("Listing", listingSchema);

module.exports = Listing;
