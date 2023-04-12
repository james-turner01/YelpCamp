const express = require('express');
//executingRouter from express
// mergeParams: true ensure that router.xyz params (in reviews.js) and app.use('/campgrounds/:id/reviews') params (in app.js) are merged.
// this means we can access app.use('/campgrounds/:id/reviews') params in this folder
const router = express.Router({ mergeParams: true });
//campground model
const Campground = require('../models/campground');
//review model
const Review = require('../models/review');
// require JOI reviewSchema
const { reviewSchema } = require('../schemas.js');
//require ExpressError
const ExpressError = require('../utils/ExpressError');
// catchAsync function
const catchAsync = require('../utils/catchAsync');
// importing the validateReview and isLoggedIn middleware
const { validateReview, isLoggedIn, isReviewAuthor } = require('../middleware');
//require review controller doc
const reviews = require('../controllers/reviews');

//post route for campsite review
router.post('/', validateReview, isLoggedIn, catchAsync(reviews.createReview))

//delete review for a cmapground
router.delete('/:reviewId', isLoggedIn, isReviewAuthor, catchAsync(reviews.deleteReview))

module.exports = router;