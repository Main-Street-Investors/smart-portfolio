const db = require("../models/models.js");
const jwtDecode = require('jwt-decode');
const bcrypt = require('bcrypt');
const loginController = {};
const saltFactor = 10;

/**
 * 
 *    check if username already exists
      if username exists but it was through a normal login (with a password), then the login should fail, and we will redirect them to our login page
      if username exists, but it was through Google OAuth, then this is a good sign-in, and we will then redirect them to /dashboard
      if username does not exist
      then create account and set boolean column to indicate that this account was created using Google OAuth
 */

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
        // Verify with front-end team if we should send an error code...
        return res.redirect('/');
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

loginController.regularSignup = async (req, res, next) => {
  try {
    const { username, password } = req.body;
    
    const hashedPassword = await bcrypt.hash(password, saltFactor, (err, hash) => {
        if (err) {
          console.log('Error with b-crypting: ', err);
          return;
        } else {
          return hash;
        }
    });

    console.log('THE HASHED PASSWORD: ', hashedPassword);

    const createUserQueryStr = `INSERT INTO users
    (username, hashed_password, email, created_by_google)
    VALUES ($1, $2, $3, $4)
    RETURNING username;`

    const createUserValue = [username, hashedPassword, '', false];

    await db.query(createUserQueryStr, createUserValue)
    .then(data => {
        console.log(data.rows);
        return next();        
    })
    .catch(err => {
        return next({
            log: `Error occurred with loginController.regularSignup middleware: ${err}`,
            message: { err: "An error occurred when creating a new user in database." }
        });
    });

  } catch (err) {
    return next({
        log: `Error occurred with loginController.regularSignUp middleware: ${err}`,
        message: { err: "An error occurred when bcrypting user password." }
      });
  }
}

module.exports = loginController;