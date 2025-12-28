const mongoose = require("mongoose");
const initData = require("./data.js");
const Listing = require("../models/listing.js");

const MONGO_URL = 'mongodb://127.0.0.1:27017/wanderlust';

main()
  .then(() => {
    console.log("✅ Process completed");
  })
  .catch((err) => {
    console.log("❌ Mongo connection error:", err);
  });

async function main() {
  await mongoose.connect(MONGO_URL);
  console.log("✅ MongoDB Connected");

  await Listing.deleteMany({});
  await Listing.insertMany(initData.data);
  console.log("✅ Data inserted");

  await mongoose.connection.close();
  console.log("🔌 Connection closed");
}
