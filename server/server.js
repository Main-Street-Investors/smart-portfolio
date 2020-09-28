const express = require('express');
const app = express();

const PORT = 3000;

const path = require('path');

// Server logic

// Serves bundle
app.use('*/bundle.js', (req, res) => {
  console.log('Serving Bundle');
  res.sendFile(path.join(__dirname, '../dist/bundle.js'));
});

// Serves assets
app.use('*/assets', (req, res) => {
  console.log('Serving Static Asset');
  express.static(path.join(__dirname, '../assets'));
});

// Serves HTML
app.get('/*', (req, res) => {
  console.log('Serving HTML');
  res.sendFile(path.join(__dirname, '../dist/index.html'));
});


// Server will listen on port 3000
app.listen(PORT, () => console.log('Server listening at port', PORT));
