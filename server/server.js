const express = require('express');
const app = express();

const path = require('path');

// Server logic

// Serves static files
app.use('/dist', express.static(path.join(__dirname, '../dist')));

// Serves HTML at base path
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, '../index.html'));
});

// Server will listen on port 3000
app.listen(3000);