const express = require("express");
const router = express.Router();
const path = require('path');
const googleController = require('../controllers/googleController');

// Google OAuth Login

router.get('/googleLogin',
  googleController.OAuth,
  (req, res) => {
    return res.redirect(res.locals.url);
  });

router.get('/googleSuccess',
  googleController.afterConsent,
  cookieController.setGoogleCookie,
  fileController.createUser,
  (req, res) => {
    // Need to change this based on functionality
    return res.redirect('/');
  });

module.exports = router;