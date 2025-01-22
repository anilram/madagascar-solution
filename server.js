const express = require('express');
const session = require('express-session');
const path = require('path');
const bodyParser = require('body-parser');
const { createProxyMiddleware } = require('http-proxy-middleware');

const app = express();

// Proxy API requests to the Matterport API
app.use(
  '/api',
  createProxyMiddleware({
    target: 'https://my.matterport.com',
    changeOrigin: true,
    pathRewrite: { '^/api': '' },
  })
);

// Middleware to parse form data
app.use(bodyParser.urlencoded({ extended: true }));

// Session middleware
app.use(
  session({
    secret: 'random-secret-key', // Change this to a secure random key
    resave: false,
    saveUninitialized: true,
    cookie: { maxAge: 3600000 }, // 1 hour
  })
);


// Middleware to disable caching
app.use((req, res, next) => {
  res.set('Cache-Control', 'no-store, no-cache, must-revalidate, private');
  res.set('Pragma', 'no-cache');
  res.set('Expires', '0');
  next();
});

// Serve static files
app.use('/bundle', express.static(path.join(__dirname, 'bundle')));

// Authentication middleware for protected pages
function checkAuth(req, res, next) {
  if (req.session.isAuthenticated) {
    next();
  } else {
    res.redirect('/');
  }
}

// Static email and password for login validation
const STATIC_USERNAME = 'madagascar_gov';
const STATIC_PASSWORD = 'agri123';

// Route for handling login
app.post('/login', (req, res) => {
  const { username, password } = req.body;

  if (username === STATIC_USERNAME && password === STATIC_PASSWORD) {
    req.session.isAuthenticated = true; // Set session variable
    res.redirect('/provinces.html'); // Redirect to protected page
  } else {
    res.send(`<script>alert("Invalid email or password!"); window.location.href = "/";</script>`);
  }
});

// Protected route for provinces.html
app.get('/provinces.html', checkAuth, (req, res) => {
  res.sendFile(path.join(__dirname, 'provinces.html'));
});

// Protected route for provinces.html
app.get('/farms.html', checkAuth, (req, res) => {
  res.sendFile(path.join(__dirname, 'farms.html'));
});


// Route for logout
app.post('/logout', (req, res) => {
  req.session.destroy(err => {
    if (err) {
      console.error('Error destroying session:', err);
      res.status(500).send('Error logging out');
    } else {
      res.redirect('/');
    }
  });
});

// Serve index.html
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

// Start the server
const PORT = 3000;
app.listen(PORT, () => {
  console.log(`Server is running at http://localhost:${PORT}`);
});
