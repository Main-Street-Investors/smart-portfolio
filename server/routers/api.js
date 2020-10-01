const express = require("express");
const router = express.Router();
const googleController = require('../controllers/googleController');
const cookieController = require('../controllers/cookieController');
const loginController = require('../controllers/loginController');
const stockController = require('../controllers/stockController');

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
router.post('/regularLogin',
  loginController.verifyUser,
  cookieController.setCookie,
  (req, res) => {
    return res.redirect('/dashboard');
  });

// Regular Signup
router.post('/regularSignup',
  loginController.checkDuplicateUser,
  loginController.regularSignup,
  cookieController.setCookie,
  (req, res) => {
    return res.redirect('/dashboard');
  });

// Obtain historical share prices
router.get('/getPortfolio',
  stockController.getSoldShares,
  stockController.getCurrentShares,
  stockController.getIEXData,
  stockController.packageIEXData,
  stockController.finalizeData,
  (req, res) => {

    let chartData = res.locals.chartData
    let IEXData = res.locals.IEXData
    let currentShares = res.locals.currentShares
    let soldShares = res.locals.soldShares

    const responseObj = {
      chartData,
      IEXData,
      currentShares,
      soldShares,
    }

    return res.json(responseObj);
  });

module.exports = router;
