const { google } = require('googleapis')

const googleController = {};

googleController.OAuth = (req, res, next) => {

  const oauth2Client = new google.auth.OAuth2(
    '329953103684-fd3u5obuomsrh1dmbeu7eekif92f0m17.apps.googleusercontent.com',
    'cJ4dyZO7s3Pp0HQhyOHvCftF',
    'http://localhost:8080/api/googleSuccess'
  );

  const scopes = [
    'https://www.googleapis.com/auth/userinfo.profile',
    'https://www.googleapis.com/auth/classroom.profile.photos',
    'https://www.googleapis.com/auth/userinfo.email'
  ];

  const url = oauth2Client.generateAuthUrl({
    access_type: 'offline',
    scope: scopes,
    response_type: 'code',
    prompt: 'consent',
  })

  res.locals.url = url;
  return next();
};

googleController.afterConsent = (req, res, next) => {

  const oauth2Client = new google.auth.OAuth2(
    '329953103684-fd3u5obuomsrh1dmbeu7eekif92f0m17.apps.googleusercontent.com',
    'cJ4dyZO7s3Pp0HQhyOHvCftF',
    'http://localhost:8080/api/googleSuccess'
  );

  oauth2Client.getToken(req.query.code)
    .then(data => {
      const { tokens } = data;
      oauth2Client.setCredentials(tokens);
      res.locals.token = tokens.id_token;
      return next();
    })
    .catch(err => console.log('Error occurred with generating token from Google OAuth: ', err))
};

module.exports = googleController;
