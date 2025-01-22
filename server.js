const express = require('express');
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

// Serve static files
app.use('/bundle', express.static(path.join(__dirname, 'bundle')));

// Serve map.html explicitly
app.use('/farms.html', express.static(path.join(__dirname, 'farms.html')));

// Serve map.html explicitly
app.use('/provinces.html', express.static(path.join(__dirname, 'provinces.html')));
// Serve map.html explicitly
app.use('/index.html', express.static(path.join(__dirname, 'index.html')));

// Static email and password for login validation
const STATIC_USERNAME = 'madagascar_gov';
const STATIC_PASSWORD = 'agri123';

// Route for handling login
app.post('/login', (req, res) => {
  const { username, password } = req.body;

  if (username === STATIC_USERNAME && password === STATIC_PASSWORD) {
    res.redirect('/provinces.html');  // Redirect to map.html on successful login
  } else {
    res.send(`<script>alert("Invalid email or password!"); window.location.href = "/";</script>`);
  }
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
