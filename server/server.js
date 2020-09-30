const express = require('express');
const app = express();
const path = require('path');
const cookieParser = require('cookie-parser');
const apiRouter = require('./routers/api');

const PORT = 3000;

// Body parsers & cookie parser
app.use(express.json());
app.use(express.urlencoded());
app.use(cookieParser());

// Server logic

// Serves bundle
app.use('*/bundle.js', (req, res) => {
  console.log('Serving Bundle');
  return res.sendFile(path.join(__dirname, '../dist/bundle.js'));
});

// Serves assets
app.use('*/assets', (req, res) => {
  console.log('Serving Static Asset');
  express.static(path.join(__dirname, '../assets'));
});

// API endpoint router
app.use('/api', apiRouter);

// Serves HTML
app.get('/*', (req, res) => {
  console.log('Serving HTML');
  return res.sendFile(path.join(__dirname, '../dist/index.html'));
});

// Global error Handler for now
app.use((err, req, res, next) => {
  // Fix error code if time is available
  return res.status(401).send(err.message);
});

// Server will listen on port 3000
app.listen(PORT, () => console.log('Server listening at port', PORT));
