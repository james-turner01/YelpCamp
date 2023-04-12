const mongoose = require('mongoose');
//requiring our model
const Campground = require('../models/campground'); // .. is so we move back up one in the directory
//requriing cities array
const cities = require('./cities');
//requring places array and descriptors array from seedHelpers
const { places, descriptors } = require('./seedHelpers')


//connect to database
mongoose.connect('mongodb://127.0.0.1:/yelp-camp')

//error handling for connecting to a database
const db = mongoose.connection;
db.on("error", console.error.bind(console, "connection error:"));
db.once("open", () => {
    console.log("Database connected");
})

//creating an array that will select a ranomd element from an array (arr)
const sample = (array) => {
    return array[Math.floor(Math.random() * array.length)];
}

//creating an async function that will seed our database
//FIRST it will remove everything from the databse
const seedDB = async () => {
    //deletes everything in Campground 
    await Campground.deleteMany({});
    for (let i = 0; i < 300; i++) {
        //random number between 0-1000 (as 1000 cities)
        const random1000 = Math.floor(Math.random() * 1000);

        //randomly generate a price
        const price = Math.floor(Math.random() * 20) + 10;

        const camp = new Campground({
            //ADDING AUTHOR FOR THE SEEDED CAMPGROUNDS
            author: "6422cf9489422371abf28708", //DO NOT DELETE THE ACCOUNT WITH USERNAME: james
            location: `${cities[random1000].city}, ${cities[random1000].state}`,
            //using samples function above to sleect random elements from descriptors and places array to create campground title
            title: `${sample(descriptors)} ${sample(places)}`,
            description: 'Lorem ipsum dolor sit amet, consectetur adipisicing elit. Tempore pariatur totam id cum maxime, omnis quod ipsam voluptas eaque aperiam voluptate a et. Voluptate rem natus delectus iusto commodi unde?',
            price: price,
            // adding geometry data:
            geometry: { 
                type: 'Point', 
                coordinates: [ 
                    cities[random1000].longitude,
                    cities[random1000].latitude 
                ] 
            },
            // adding a random image from collection  483251
            images: [
                {
                    url: 'https://res.cloudinary.com/deaadtnoe/image/upload/v1680170916/YelpCamp/tcn53vyusdsosrstxtgt.jpg',
                    filename: 'YelpCamp/tcn53vyusdsosrstxtgt'
                },
                {
                    url: 'https://res.cloudinary.com/deaadtnoe/image/upload/v1680170921/YelpCamp/w7lcfbhtww5wuw7tdxtp.png',
                    filename: 'YelpCamp/w7lcfbhtww5wuw7tdxtp'
                }
            ]
        })
        //save new campground
        await camp.save();
    }
}

//execute seedDB
seedDB().then(() => {
    //close connection to db once SeedDb has executed
    mongoose.connection.close()
});

