const express = require("express");
const router = express.Router();
const googleController = require('../controllers/googleController');
const cookieController = require('../controllers/cookieController');
const loginController = require('../controllers/loginController');

// Google OAuth Login

router.get('/googleLogin',
  googleController.OAuth,
  (req, res) => {
    return res.redirect(res.locals.url);
  });

router.get('/googleSuccess',
  googleController.afterConsent,
  loginController.verifyGoogleUser,
  cookieController.setCookie,
  (req, res) => {
    return res.redirect('/dashboard');
  });

// Regular Login
router.get('/regularLogin',
  // googleController.afterConsent,
  // loginController.verifyGoogleUser,
  // cookieController.setCookie,
  (req, res) => {
    return res.redirect('/dashboard');
  });
  
// Regular Signup
router.post('/regularSignup',
  loginController.regularSignup,
  // loginController.verifyGoogleUser,
  // cookieController.setCookie,
  (req, res) => {
    return res.redirect('/dashboard');
  });


module.exports = router;