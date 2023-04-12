const Campground = require('../models/campground');
const Review = require('../models/review');


module.exports.createReview = async (req, res) => {
    //find the campground based on id
    const campground = await Campground.findById(req.params.id);
    //creates new review document
    const review = new Review(req.body.review);
    //adds the author to the review object
    review.author = req.user._id;
    //push on conto campground.reviews array the creview id
    campground.reviews.push(review);
    //save our review and campground
    await review.save();
    await campground.save();
    //creating a success flash when a new review is created
    req.flash('success', 'Successfully added a review');
    res.redirect(`/campgrounds/${campground._id}`);
}

module.exports.deleteReview = async (req, res) => {
    //destructiring campground and review ids
    const { id, reviewId } = req.params;
    //deleting the review reference ObjectId from campground.review
    // we will use the $pull operator from Mongodb
    //this will 'pull' the review with the value = reviewId from the campground of id = id
    await Campground.findByIdAndUpdate(id, { $pull: { reviews: reviewId } });
    //deleting the review
    await Review.findByIdAndDelete(req.params.reviewId);
    //creating a success flash when a new review is deleted
    req.flash('success', 'Successfully deleted review');
    //redirect to campgrounds page
    res.redirect(`/campgrounds/${id}`);
}