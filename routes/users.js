// contain our routes for user lgin, registration, logout etc
//requiring express
const express = require('express');
//create a router
const router = express.Router();
//require catchAsync function
const catchAsync = require('../utils/catchAsync');
//import user model
const User = require('../models/user');
// require passport
const passport = require('passport');
//require users controller
const users = require('../controllers/users');

//grouping the register routes
router.route('/register')
    //get request to get our registration from
    .get(users.renderRegister)
    // POST request for registering
    .post(catchAsync(users.register))

//grouping the login routes
router.route('/login')
    .get(users.renderLogin)
    //note: using passports authenticate method where:
    // failureFlash: true (flash a message automatically if login fails)
    // failureRedirect: '/login' if it fails to login it will redirect us to the login page again
    .post(passport.authenticate('local', { failureFlash: true, failureRedirect: '/login', keepSessionInfo: true }), users.login)

//logout route
router.get('/logout', users.logout);

module.exports = router;