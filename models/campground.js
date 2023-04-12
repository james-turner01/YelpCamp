const mongoose = require("mongoose");
//require Review model
const Review = require('./review');

//creating a variable for our Schema
//we will reference mongoose.Schema quite a lot so this acts as a bit of a shortcut
const Schema = mongoose.Schema;

//image schema so that we can use virtual properties for thumbnail url (using Cloudinary API)
const ImageSchema = new Schema({
    url: String,
    filename: String
})

//adding a virtual property to every Image so we can generate a thumbnail url when needed
ImageSchema.virtual('thumbnail').get(function () {
    //this refers to the particular image
    //creating the thumbnail url from the image.url
    return this.url.replace('/upload', '/upload/w_200');
})

//setting our options for CampgroudSchema
//setting toJSON virtuals to be tru --> so virtuals are included in the result object
// we need this so that we can acces properties.popupMarkup for our clusterMap poppups
const opts = {toJSON: {virtuals: true}};

//creating our Schema
const CampgroundSchema = new Schema({
    title: String,
    images: [ImageSchema], //referencing the ImageSchema above
    geometry: {
        type: {
            type: String,
            enum: ['Point'], // 'geometry.type' must be 'Point'
            required: true
        },
        coordinates: {
            type: [Number],
            required: true
        }
    },
    price: Number,
    description: String,
    location: String,
    author: {
        type: Schema.Types.ObjectId, // we want the an Object ID as the type
        ref: 'User' //reference is the user model (it will come from the user model)
    },
    reviews: [
        {
            type: Schema.Types.ObjectId, //want object Ids in this arry
            ref: "Review" //reference is the review model
        }
    ]
}, opts) //passing in opts

//adding a virtual property called popupText that will generate popUpMarkup for our clusterMap when an individual campsite is clicked on
CampgroundSchema.virtual('properties.popupMarkup').get(function () {
    // this refers to the particular campground instance
    return `
    <strong><a href="/campgrounds/${this._id}">${this.title}</a></strong>
    <p>${this.description.substring(0, 20)}...</p>` //displays the desciption, but will truncate it if it is too long
})

// creating middleware for findOneAndDelete method (also triggered by findByIdAndDelete)
CampgroundSchema.post('findOneAndDelete', async function (doc) {
    //id did find 'doc' (a campgroudn) and deleted it..
    if (doc) {
        //delete all reviews from Review model that have an _id inside of campground.reviews (reviews array for the campground)
        await Review.deleteMany({
            _id: {
                $in: doc.reviews
            }
        })
    }
})

//exporting our model which we compile
module.exports = mongoose.model('Campground', CampgroundSchema)