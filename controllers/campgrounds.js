//define Campground model
const Campground = require('../models/campground');
// requiring MapBox goecoding service
const mbxGeocoding = require('@mapbox/mapbox-sdk/services/geocoding');
// accessing our mapbox access token
const mapBoxToken = process.env.MAPBOX_TOKEN;
// instantiating a new mbxGoecoding instance, where we pass in our token:
const geocoder = mbxGeocoding({ accessToken: mapBoxToken });
//require cloudinary object from cloudinary/index.js
const { cloudinary } = require('../cloudinary');

// a module that will carry out the logic in the index route:
module.exports.index = async (req, res) => {
    //find all campgrounds from db
    const campgrounds = await Campground.find({});
    // render index.js in campgrounds folder in views folder
    res.render('campgrounds/index', { campgrounds });
}

module.exports.renderNewForm = (req, res) => {
    res.render('campgrounds/new');
}

module.exports.createCampground = async (req, res, next) => {
    // take our geocoder client and call forward method on it:
    const geoData = await geocoder.forwardGeocode({
        query: req.body.campground.location,
        //Limit the number of results returned. (optional, default 5)
        limit: 1
    }).send()
    const campground = new Campground(req.body.campground);
    // adding geometry property to the new campground
    campground.geometry = geoData.body.features[0].geometry;
    // loop over the files in req.files
    // for each files we want to add the path and filename to the new Campground
    // f = a file in the req.files array. We map over the array in req.files f.path to url and f.filename to filename
    campground.images = req.files.map(f => ({ url: f.path, filename: f.filename }));
    // setting the author of the campgroud to be the _id stored in req.user
    campground.author = req.user._id;
    await campground.save();
    //create a flash message when a new campground is created
    req.flash('success', 'Successfully made a new campground!')
    res.redirect(`campgrounds/${campground._id}`);
}

module.exports.showCampground = async (req, res) => {
    // populate the reviews and the author
    const campground = await Campground.findById(req.params.id).populate({
        //populate the reviews
        path: 'reviews',
        // within the reviews populate the author of each review
        populate: {
            path: 'author'
        }
        //populate the author for the campground
    }).populate('author');
    // if campgroudn is NOT found in line above, flash error
    if (!campground) {
        req.flash('error', 'Cannot find that campground!');
        //redirect to index page
        return res.redirect('/campgrounds');
    }
    res.render('campgrounds/show', { campground });
}

module.exports.renderEditForm = async (req, res) => {
    const { id } = req.params;
    //find campground by id
    const campground = await Campground.findById(id)
    // if campgroudn is NOT found in line above, flash error
    if (!campground) {
        req.flash('error', 'Cannot find that campground!');
        //redirect to index page
        return res.redirect('/campgrounds');
    }
    res.render('campgrounds/edit', { campground });
}

module.exports.updateCampground = async (req, res) => {
    const { id } = req.params;
    // console.log(req.body);
    //update the campground data
    // using ... spread operator to spread what is in req.body.campground to match the Schema of Campground model
    const campground = await Campground.findByIdAndUpdate(id, { ...req.body.campground });
    // map the uploaded images into an array
    const imgs = req.files.map(f => ({ url: f.path, filename: f.filename }));
    //push the above array onto the existing images array in campground
    // note ... is the spread operator which we need to apply to imgs so that we don't have an array inside an array
    campground.images.push(...imgs);
    await campground.save();
    //if there ARE images to delete 
    if (req.body.deleteImages) {
        // deleting the images from Cloudinary
        for (let filename of req.body.deleteImages) {
            await cloudinary.uploader.destroy(filename);
        }
        //DELETING IMAGES FROM MONGO
        //updating the campground we found in the code above
        //$pull operator pulls out of the images array.
        // It will pull out the images where the image filename is IN req.body.deleteImages array
        await campground.updateOne({ $pull: { images: { filename: { $in: req.body.deleteImages } } } });
        // console.log(campground)
    }
    //creating success flash for when a campground is successfully edited
    req.flash('success', 'Successfully updated campground')
    res.redirect(`/campgrounds/${campground._id}`);
}

module.exports.deleteCampground = async (req, res) => {
    const { id } = req.params;
    const campground = await Campground.findByIdAndDelete(id);
    //creating a success flash when a campground is deleted
    req.flash('success', 'Successfully deleted campground');
    res.redirect('/campgrounds');
}