// if we are not in production mode, require the dotenv module
// process.env.NODE_ENV is an environment variable that is usually development or production
// if we are running in development mode require thedotenv package
// it will hten take the variables we have defined in our .env file and add them int process.env in our node app
// so we can access them in our files
if (process.env.NODE_ENV !== 'production') {
    require('dotenv').config();
}

const express = require('express');
const path = require('path');
const mongoose = require('mongoose');
//require method override to create put request for edit form
const methodOverride = require('method-override');
//require ejs-mate
const ejsMate = require('ejs-mate');
//require ExpressError class
const ExpressError = require('./utils/ExpressError');
//require express-session
const session = require('express-session');
//require connect-flash
const flash = require('connect-flash');
//require passport
const passport = require('passport');
//require passport-local
const LocalStrategy = require('passport-local');
// require user model
const User = require('./models/user');
//require campgroudns router
const campgroundRoutes = require('./routes/campgrounds');
//require reviews router
const reviewRoutes = require('./routes/reviews');
//require the users.js routes file
const userRoutes = require('./routes/users');

//require helmet
const helmet = require('helmet');

//requring connect-mongo
const MongoStore = require('connect-mongo');


//requring express-mongo-sanitize package to prevent Mongo Injection
const mongoSanitize = require('express-mongo-sanitize');

// saving the DB url to const (accessing from .env file for now)
// const dbUrl = 'mongodb://127.0.0.1:/yelp-camp';
const dbUrl = process.env.DB_URL || 'mongodb://127.0.0.1:/yelp-camp';
//connect to database
// 'mongodb://127.0.0.1:/yelp-camp'
mongoose.connect(dbUrl);


//error handling for connecting to a database
const db = mongoose.connection;
db.on("error", console.error.bind(console, "connection error:"));
db.once("open", () => {
    console.log("Database connected");
})

const app = express();

// telling express we want to use ejsMate as the ejs engine
app.engine('ejs', ejsMate);
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

//telling express to parse the body from a post request
app.use(express.urlencoded({ extended: true }));

//app.use method override
//_method is the string we want to use to notify ina query string the method we want to use for the form
app.use(methodOverride('_method'));

//creating secret as a .env variable
// OR the other secret is a development backup
const secret = process.env.SECRET || 'thisshouldbeabettersecret';

//creating a newMongoDB store
const store = MongoStore.create({
    mongoUrl: dbUrl,
    // touchAfter, you do not want to resave all the session in DB every time a user refreshes the pag.
    //instead you can lazy update the session, by limiting a period of time:
    touchAfter:24 * 60 * 60, //time period in seconds
    crypto: {
        secret,
    }
})

//check for errors for our session store
store.on("error", function(e) {
    console.log("SESSION STORE ERROR", e)
})

//creating sessionConfig object
const sessionConfig = {
    // passing in our session store into sessionConfig
    store, // it will now using Mongo to store our information
    // naming the session to 'session'
    name: 'session',
    secret,
    resave: false,
    saveUninitialized: true,
    //configuring the cookie we send back
    cookie: {
        //adding seurity to the cookie so that it cannot be accessed by third parties
        httpOnly: true,
        // session cookie only accessible on https
        // secure: true,
        //set expiration date for the cookie from a week from 'now'
        //Note units are milliseconds so 1000 * 60*60*7 = how many milliseconds ina  week
        expires: Date.now() + 1000 * 60 * 60 * 24 * 7,
        //setting maxAge for the cookie we send back
        maxAge: 1000 * 60 * 60 * 24 * 7,
    }
}

//app.uuse express session
// configure sessions with sessionConfig object:
app.use(session(sessionConfig))

//app.use flash
app.use(flash());

//app.use helmet
// this will enable all of the middleware that helmet comes with
app.use(helmet());

// adding in our own configuration for contentSecurityPolicy

// sources and scripts we want to allow
const scriptSrcUrls = [
    "https://stackpath.bootstrapcdn.com/",
    "https://api.tiles.mapbox.com/",
    "https://api.mapbox.com/",
    "https://kit.fontawesome.com/",
    "https://cdnjs.cloudflare.com/",
    "https://cdn.jsdelivr.net/",


];
const styleSrcUrls = [
    "https://kit-free.fontawesome.com/",
    "https://stackpath.bootstrapcdn.com/",
    "https://api.mapbox.com/",
    "https://api.tiles.mapbox.com/",
    "https://fonts.googleapis.com/",
    "https://use.fontawesome.com/",
    "https://cdn.jsdelivr.net/",
    "https://res.cloudinary.com/dv5vm4sqh/"
];
const connectSrcUrls = [
    "https://*.tiles.mapbox.com",
    "https://api.mapbox.com",
    "https://events.mapbox.com",
    "https://res.cloudinary.com/dv5vm4sqh/"
];
const fontSrcUrls = ["https://res.cloudinary.com/dv5vm4sqh/"];

app.use(
    helmet.contentSecurityPolicy({
        directives: {
            defaultSrc: [],
            connectSrc: ["'self'", ...connectSrcUrls],
            scriptSrc: ["'unsafe-inline'", "'self'", ...scriptSrcUrls],
            styleSrc: ["'self'", "'unsafe-inline'", ...styleSrcUrls],
            workerSrc: ["'self'", "blob:"],
            objectSrc: [],
            imgSrc: [
                "'self'",
                "blob:",
                "data:",
                "https://res.cloudinary.com/deaadtnoe/", //SHOULD MATCH YOUR CLOUDINARY ACCOUNT!
                "https://images.unsplash.com/"
            ],
            fontSrc: ["'self'", ...fontSrcUrls],
            mediaSrc: ["https://res.cloudinary.com/dv5vm4sqh/"],
            childSrc: ["blob:"]
        }
    })
);

//app.use for passport
app.use(passport.initialize()); // initialise middleware needed for peristent login
app.use(passport.session());  // also need this middleware. passport.session MUST BE USED AFTER app.use(session())
// telling passport to use LocalStrategy (passport-local pacakge) and use the authentication method called authenticate stored in our User model (User.authenticate())
// authenticate() is a method added in to passport-local-mongoose automatically (not created by us)
passport.use(new LocalStrategy(User.authenticate()));

// telling passport how to serialize a user
// serialization refers to how do we store a user in the session
passport.serializeUser(User.serializeUser())
// telling passport how to DEserialize a user
//DEserialization refers to how we GET  a user out of the session
passport.deserializeUser(User.deserializeUser());

// middleware that will mean if here is anything in flash, it is available in all templates as a LOCAL VARIABLE
app.use((req, res, next) => {
    // console.log(req.query)
    //set res.locals to ihave property called success inside it that will have the flash message from 'success'
    // we will have access to res.locals.success in our templates automatically, so we do not have to pass through 'success' for every template we want it in
    res.locals.success = req.flash('success');
    //for errors (if there is anything stored under the key of 'error'):
    res.locals.error = req.flash('error');
    // getting access to user information and storing it as in res.local for ALL reuests
    res.locals.currentUser = req.user;
    next();
})

app.get('/fakeUser', async (req, res) => {
    // create a new User
    // Note: DO NOT pass in apassowrd as we use a method called register() as part of passport-local-mongoose plugin
    const user = new User({ email: 'coltttt@gmail.com', username: 'colttt' });
    // register a user by passing in user object and a password
    // it will hash and store this information (await it as it takes time)
    const newUser = await User.register(user, 'chicken');
    res.send(newUser)
})

//app.use for the user routes
app.use('/', userRoutes);
//app.use for the campground routes
app.use('/campgrounds', campgroundRoutes)
// app.use for reviews routes
app.use('/campgrounds/:id/reviews', reviewRoutes)
//app.use to set express static assets to be the public folder in our project folder
app.use(express.static(path.join(__dirname, 'public')))

// To use mongoSanitize on ALL requests:
app.use(mongoSanitize());

app.get('/', (req, res) => {
    res.render('home');
});

//will run for every request and path (if none of th eabove app.xyzs don't work for a request)
app.all('*', (req, res, next) => {
    next(new ExpressError('Page Not Found', 404));
})

//basic error handler - will end up here if next is passed in any middleware our route handlers above
app.use((err, req, res, next) => {
    //destructure status code from err
    const { statusCode = 500 } = err;
    if (!err.message) err.message = "Something went wrong"
    //update status code and render errors.ejs in views directory
    res.status(statusCode).render('errors', { err })
})

app.listen(3000, () => {
    console.log("Serving On Port 3000")
})