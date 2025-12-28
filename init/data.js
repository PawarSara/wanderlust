const mongoose = require("mongoose");
const Listing = require("../models/listing"); // make sure path is correct

mongoose.connect("mongodb://127.0.0.1:27017/yourDB", { 
  useNewUrlParser: true, 
  useUnifiedTopology: true 
})
.then(() => console.log("MongoDB Connected"))
.catch(err => console.log(err));

const listings = [
  {
    title: "Sea View Apartment",
    description: "A beautiful apartment with a stunning view of the Arabian Sea.",
    price: 4500,
    country: "India",
    location: "Mumbai",
    image: {
      url: "https://cdn.pixabay.com/photo/2016/11/29/03/53/apartment-1869364_1280.jpg",
      filename: "mumbai_sea_view"
    },
    geometry: { type: "Point", coordinates: [72.8777, 19.0760] },
    reviews: [],
    owner: null
  },
  {
    title: "Cozy Cottage",
    description: "A cozy cottage in the hills, perfect for a weekend getaway.",
    price: 3000,
    country: "India",
    location: "Shimla",
    image: {
      url: "https://cdn.pixabay.com/photo/2017/12/29/21/54/cottage-3044944_1280.jpg",
      filename: "shimla_cottage"
    },
    geometry: { type: "Point", coordinates: [77.1734, 31.1048] },
    reviews: [],
    owner: null
  },
  {
    title: "Downtown Studio",
    description: "Modern studio apartment in the heart of Bengaluru city.",
    price: 3500,
    country: "India",
    location: "Bengaluru",
    image: {
      url: "https://cdn.pixabay.com/photo/2016/11/21/15/07/living-room-1845457_1280.jpg",
      filename: "bengaluru_studio"
    },
    geometry: { type: "Point", coordinates: [77.5946, 12.9716] },
    reviews: [],
    owner: null
  },
  {
    title: "Heritage Villa",
    description: "Luxurious heritage villa in Jaipur with traditional Rajasthani architecture.",
    price: 5500,
    country: "India",
    location: "Jaipur",
    image: {
      url: "https://cdn.pixabay.com/photo/2016/03/27/22/22/architecture-1283626_1280.jpg",
      filename: "jaipur_villa"
    },
    geometry: { type: "Point", coordinates: [75.7873, 26.9124] },
    reviews: [],
    owner: null
  }
];

const seedDB = async () => {
  await Listing.deleteMany({});
  await Listing.insertMany(listings);
  console.log("Database seeded!");
  mongoose.connection.close();
}

seedDB();
