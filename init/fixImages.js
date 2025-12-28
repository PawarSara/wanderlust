const mongoose = require("mongoose");
const Listing = require("../models/listing.js");

mongoose.connect("mongodb://127.0.0.1:27017/wanderlust")
  .then(async () => {
    console.log("✅ Connected");

    const defaultUrl = "https://cdn-images-1.medium.com/max/2000/1*YRINRZFr0E1FRJ4JpizEMw.jpeg";

    const result = await Listing.updateMany(
      { $or: [{ image: "" }, { image: { $exists: false } }] },
      { $set: { image: defaultUrl } }
    );

    console.log(`✅ Fixed ${result.modifiedCount} listings`);
    mongoose.connection.close();
  })
  .catch(err => console.log("❌ Error:", err));
