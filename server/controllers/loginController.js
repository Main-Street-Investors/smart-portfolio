const db = require("../models/models.js");
const jwtDecode = require('jwt-decode');
const bcrypt = require('bcrypt');
const loginController = {};
const saltFactor = 10;

// Check if username already exists
  // if username exists but it was through a normal login (with a password), then the login should fail, and we will redirect them to our login page
  // if username exists, but it was through Google OAuth, then this is a good sign-in, and we will then redirect them to /dashboard
// If username does not exist
  // then create account and set boolean column to indicate that this account was created using Google OAuth


loginController.verifyGoogleUser = (req, res, next) => {

  const decoded = jwtDecode(res.locals.token);
  const email = decoded.email;

  res.locals.username = email;

  const getSelectedUserQuery = `SELECT * FROM users WHERE username=$1`;
  const getSelectedUserVal = [email];
  
  const createUserStr = `INSERT INTO users
                         (username, hashed_password, email, created_by_google)
                         VALUES ($1, $2, $3, $4)
                         RETURNING username`;
  const createUserVal = [email, null, '', true];

  db.query(getSelectedUserQuery, getSelectedUserVal)
    .then(data => {
    if(data.rows.length && !data.rows[0].created_by_google) {
        return res.redirect('/login');
    } else if (data.rows.length && data.rows[0].created_by_google) {
          return next();
    } else {
      // User does not exist  
      db.query(createUserStr, createUserVal)
        .then(res => { return next(); })
        .catch(err => {
          return next({
            log: `Error occurred with new user creation at database level: ${err}`,
            message: { err: 'An error occurred when creating a new user in the database.' }
          })
        })
        }
    })
    .catch(err => {
      return next({
        log: `Error occurred with loginController.verifyUser middleware: ${err}`,
        message: { err: "An error occurred when checking user information from database." }
      });
    });
}

loginController.regularSignup = (req, res, next) => {

    const { username, password } = req.body;
    
    bcrypt.hash(password, saltFactor, (err, hash) => {
      if (err) {
        return next({
          log: `Error occurred with b-crypting process: ${err}`,
          message: { err: "An error occurred when encrypting the password." }
        });
        
      } else {
        const createUserQueryStr = `INSERT INTO users
                                    (username, hashed_password, email, created_by_google)
                                    VALUES ($1, $2, $3, $4)
                                    RETURNING username`;
    
        const createUserValue =  [username, hash, '', false];
    
        db.query(createUserQueryStr, createUserValue)
        .then(data => {
            // console.log('data rows: ', data.rows);
            res.locals.username = username;
            return next();
        })
        .catch(err => {
            return next({
                log: `Error occurred with creating a new user in the database: ${err}`,
                message: { err: "An error occurred when creating a new user in database." }
            });
        });     
      }
    });
}

loginController.checkDuplicateUser = (req, res, next) => {
  const { username } = req.body;

  const getSelectedUserQuery = `SELECT * FROM users WHERE username=$1`;
  const getSelectedUserVal = [username];
  
  db.query(getSelectedUserQuery, getSelectedUserVal)
  .then(data => {
    if(data.rows.length) {
        return res.redirect('/login');
    }
    return next();
    })
    .catch(err => {
      return next({
        log: `Error occurred with loginController.checkUser middleware: ${err}`,
        message: { err: "An error occurred when checking if user exists in database." }
      });
    });
}

loginController.verifyUser = (req, res, next) => {
  
  const { username, password } = req.body;

  const getUserQuery = `SELECT * FROM users WHERE username=$1`;
  const getUserVal = [username];
  
  db.query(getUserQuery, getUserVal)
  .then(data => {
    let passwordInDB = data.rows[0].hashed_password;
    bcrypt.compare(password, passwordInDB, (err, isMatch) => {
      if(isMatch) {
        res.locals.username = username;
        return next();
      } else {
        return next({
          log: `Error occurred with verifying user's password in the database : ${err}`,
          message: { err: "An error occurred while verifying user in database." }
        });  
      }
    });
  })
  .catch(err => {
    return next({
      log: `Error occurred with verifying user in the database : ${err}`,
      message: { err: "An error occurred while checking if user exists in database." }
    });
  })
}

module.exports = loginController;
