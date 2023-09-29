const User = require('../models/user');
const passport = require('passport');

module.exports.renderRegister = (req, res) => {
    res.render('users/register')
}

module.exports.register = async (req, res, next) => {
    try {
        //destructuring email, username and password from req.body
        const { email, username, password } = req.body;
        const user = new User({ email, username });
        //using register method from passport passing in the user (with email and username) and the password
        // it will then store the username, email, hashed password and the password salt in an object
        const registeredUser = await User.register(user, password);
        // using login method in req obect (from passport) to login the newly registered user
        req.login(registeredUser, err => {
            if (err) return next(err);
            //flash message
            req.flash('success', 'Welcome to Yelp Camp');
            res.redirect('/campgrounds');
        });
    } catch (e) {
        // if an error is caught flash the message of error, e
        req.flash('error', e.message);
        // redirect to registration page
        res.redirect('register');
    }
}

module.exports.renderLogin = (req, res) => {
    res.render('users/login');
}


module.exports.login = (req, res) => {
    // if you make it into the route handler then that means passport.authenticate was successful
    req.flash('success', 'welcome back!');
    // check to see if there is a url stored in res.locals.returnTo, if there is save it to redirectUrl
    // if there is not set redirectUrl to '/campgrounds'
    const redirectUrl = res.locals.returnTo || '/campgrounds';
    res.redirect(redirectUrl);
}

module.exports.logout = (req, res, next) => {
    // using logout method from passport that is stored in the req object
    // req.logout() call now requires a callback function as an argument. Within the callback we handle any potential errors and execute the flash message and redirect code.
    req.logout(function (err) {
        if (err) {
            return next(err);
        }
        req.flash('success', 'Goodbye!');
        res.redirect('/campgrounds');
    });
}