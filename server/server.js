const express = require('express');
const app = express();
const path = require('path');
const cookieParser = require('cookie-parser');
const apiRouter = require('./routers/api');

// Body parsers & cookie parser
app.use(express.json());
app.use(express.urlencoded());
app.use(cookieParser());

// Server logic

// Serves static files
app.use('/dist', express.static(path.join(__dirname, '../dist')));

// Serves HTML at base path
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, '../index.html'));
});

// Api router
app.use('/api', apiRouter);

// Server will listen on port 3000
app.listen(3000);