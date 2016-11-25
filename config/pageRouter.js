var mysqlConnection = require(__dirname + '/database.js');
var express = require('express');
var router = express.Router();
var path = require('path');
var logger = require(__dirname + '/logger.js');


module.exports = function(app) {

    //pages route
    router.get('/index', isLoggedIn, function(req, res) {
        logger.info(req.ip + " access home page ");
        var hrstart = process.hrtime();
        setTimeout(function() {
            console.log("timeout");
        }, 1000);
        res.render('index.ejs', { user: req.user });
        var hrend = process.hrtime(hrstart);
        console.log("Execution time (hr): ", hrend[0], hrend[1] / 1000000);


    });
    router.get('/balanceInquire', isLoggedIn, function(req, res) {
        logger.info(req.user.id + " access balanceInquire Page")
        res.render('balanceInquire.ejs', { user: req.user });
    });
    router.get('/deposit', isLoggedIn, function(req, res) {
        logger.info(req.ip + " access deposit Page")

        res.render('deposit.ejs', { user: req.user });
    });
    router.get('/debit', isLoggedIn, function(req, res) {
        logger.info(req.ip + " access debit Page")

        res.render('debit.ejs', { user: req.user });
    });
    router.get('/inquire', isLoggedIn, function(req, res) {
        logger.info(req.ip + " access inquire Page")

        res.render('inquire.ejs', { user: req.user });
    });

    router.get('/accountManagement', isLoggedIn, function(req, res) {
        logger.info(req.ip + " access accountManagement Page")
        res.render('account_management.ejs', { user: req.user });
    });
    router.get('/', function(req, res) {
        logger.info(req.ip + " access log in page");
        res.render('login.ejs', { message: req.flash('signInMessage') });
    });
    router.get('/signup', function(req, res) {
        logger.info(req.ip + " access signup Page")

        res.render('signup.ejs', { message: req.flash('signUpMessage') });
    });
    router.get('/signupSummary', function(req, res) {
        // res.status(200);
        logger.info(req.ip + " access signupSummary Page")
        res.render('signupSummary.ejs', { user: req.user });
    });

    router.get('/privacyPolicy', function(req, res) {
        // res.status(200);
        logger.info(req.ip + " access privacy_policy Page")
        res.render('privacy_policy.ejs');
    });
    // res.status(200);
    router.get('/location', isLoggedIn, function(req, res) {
        logger.info(req.ip + " access location Page")
        res.render('location.ejs', { user: req.user });
    });

    router.get('/profile', isLoggedIn, function(req, res) {
        logger.info(req.ip + " access profile Page")
        res.render('profile.ejs', { user: req.user });
    });

    router.get('/logout', function(req, res) {
        req.logout();
        res.redirect('/');
    });

    app.use('/', router)
        // route middleware to make sure a user is signed in
    function isLoggedIn(req, res, next) {

        // if user is authenticated in the session, carry on 
        if (req.isAuthenticated()) {
            logger.info(req.user.username + "is authenticated");
            return next();
        }
        logger.info("Unauthenticated " + req.ip + "tries to access" + JSON.stringify(req.url));
        // if they aren't redirect them to the home page
        res.redirect('/');
    }

}
