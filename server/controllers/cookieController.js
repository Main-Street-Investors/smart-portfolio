const cookieController = {};

cookieController.setCookie = (req, res, next) => {
  res.cookie('user', res.locals.username, { httpOnly: true });
  
  if (res.locals.token) {
    res.cookie('token', res.locals.token, { httpOnly: true });
  }
  
  return next();
};

// Not currently in use yet.
cookieController.isLoggedIn = (req, res, next) => {
  // Need to modify this with NON-OAUTH LOGIN
  if (req.cookies.token) {
    return next();
  } else {
    return next({
      log: `User is not logged in`,
      code: 401,
      message: { err: "User is not logged in." },
    });
  }
};

// Not currently in use yet.
cookieController.removeCookie = (req, res, next) => {
  res.clearCookie('token');
  return next();
}

module.exports = cookieController;
