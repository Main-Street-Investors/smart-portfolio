const app = require('./server');
const PORT = process.env.PORT || 3000;

// Server will listen on port 3000
app.listen(PORT, () => console.log('Server listening at port', PORT));
