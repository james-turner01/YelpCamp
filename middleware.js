// require JOI campgroundSchema and the reviewSchema
const { campgroundSchema, reviewSchema } = require('./schemas.js');
//require ExpressError
const ExpressError = require('./utils/ExpressError');
//require campground model
const Campground = require('./models/campground');
const Review = require('./models/review');

// creating middleware that checks to see if the user is logged in
module.exports.isLoggedIn = (req, res, next) => {
    // if user is NOT signed in
    if (!req.isAuthenticated()) {
        // store the oringalUrl we were trying to request in the session under property called returnTo
        req.session.returnTo = req.originalUrl;
        //flash error
        req.flash('error', 'You must be signed in first!');
        // redirect to login page
        return res.redirect('/login');
    }
    // if you are authenticated, call next
    next();
}

// middelware function for our Joi validation of campground
module.exports.validateCampground = (req, res, next) => {
    //validate req.body based on the campgroundSchema
    const { error } = campgroundSchema.validate(req.body);
    //console.log(req.body)
    // if there is an error from our validation schema
    if (error) {
        //details is an array so we pass over the array and convert it into a string so it is one message
        // for every element in msg, get the message of the element and join them with a comma to create one long message
        const msg = error.details.map(el => el.message).join(',')
        // throw new ExpressError (pass it on to our error handler)
        throw new ExpressError(msg, 400)
    } else {
        next();
    }
}

// middleware to ceck to see if the author is logged in (for when trying to edit or delete a campgroudn)
module.exports.isAuthor = async (req, res, next) => {
    const { id } = req.params;
    // find the campground By Id:
    const campground = await Campground.findById(id);
    // if campground author DOES NOT equal req.user._id
    if (!campground.author.equals(req.user._id)) {
        req.flash('error', 'You do not have permission to do that!');
        return res.redirect(`/campgrounds/${id}`)
    }
    // else move on with next
    next();
}

// middleware to ceck to see if the author logged in matches the author of the review we are trying to delete
module.exports.isReviewAuthor = async (req, res, next) => {
    // id = id of campground, reviewId = reviewId
    const { id, reviewId } = req.params;
    // find the review By Id:
    const review = await Review.findById(reviewId);
    // if review author DOES NOT equal req.user._id
    if (!review.author.equals(req.user._id)) {
        req.flash('error', 'You do not have permission to do that!');
        return res.redirect(`/campgrounds/${id}`)
    }
    // else move on with next
    next();
}

//middleware function for our Joi validation of review
module.exports.validateReview = (req, res, next) => {
    const { error } = reviewSchema.validate(req.body);
    if (error) {
        const msg = error.details.map(el => el.message).join(',')
        throw new ExpressError(msg, 400)
    } else {
        next();
    }
}