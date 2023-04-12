const express = require('express');
//executingRouter from express
const router = express.Router();
//require catchSync function
const catchAsync = require('../utils/catchAsync');
//require Campground Model
const Campground = require('../models/campground');
// import the modules from our campgrounds controller:
const campgrounds = require('../controllers/campgrounds');
// requring and initializing multer so that we can use the multer middleware for multipart forms
const multer = require('multer');
// requiring our storage variable that is connected to Cloudinary with our credentials
const { storage } = require('../cloudinary');
//stores the images submitted in the form in storage (above)
const upload = multer({ storage });

// importing the isLoggedIn, validateCampground and isAuthor middleware
const { isLoggedIn, validateCampground, isAuthor } = require('../middleware');

// grouping routes for '/campgrounds'
router.route('/')
    // index route
    .get(catchAsync(campgrounds.index))
    //post route for new campground form
    .post(isLoggedIn, upload.array('image'), validateCampground, catchAsync(campgrounds.createCampground))

//get request for form to create a new camground
router.get('/new', isLoggedIn, campgrounds.renderNewForm);

// grouping routes for /campgrounds/:id
router.route('/:id')
    // SHow route for individual camgrounds (based on id)
    .get(catchAsync(campgrounds.showCampground))
    //put request when edit form is submitted, thus updating the campground data
    .put(isLoggedIn, isAuthor, upload.array('image'), validateCampground, catchAsync(campgrounds.updateCampground))
    //delete route
    .delete(isLoggedIn, isAuthor, catchAsync(campgrounds.deleteCampground))
//get reuqest to edit camp via a form
router.get('/:id/edit', isLoggedIn, isAuthor, catchAsync(campgrounds.renderEditForm))

module.exports = router;