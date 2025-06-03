const http = require('http');
const handleRegister = require('../routes/auth/register');
const handleLogin = require('../routes/auth/login');
const handleLogout = require('../routes/auth/logout');
const { verifyJWT } = require('../middleware/auth');
const handleNews = require('../routes/resources/news');
const handleDocuments = require('../routes/resources/documents');
const handleImages = require('../routes/resources/images');
const handleVideos = require('../routes/resources/videos');
const handleRecommendations = require('../routes/resources/recommendations');
const handleSearch = require('../routes/resources/search');
const handlePreferences = require('../routes/user/preferences');

const PORT = process.env.PORT || 3000;

function withAuth(handler) {
  return (req, res) => {
    verifyJWT(req, res, () => handler(req, res));
  };
}

const server = http.createServer((req, res) => {
    // --- AUTH ---
  if (req.method === 'POST' && req.url === '/auth/register') {
    handleRegister(req, res);
  } else if (req.method === 'POST' && req.url === '/auth/login') {
    handleLogin(req, res);
  } else if (req.method === 'POST' && req.url === '/auth/logout') {
    withAuth(handleLogout)(req, res);

  // --- RESOURCES ---
  } else if (req.method === 'GET' && req.url === '/resources/news') {
    handleNews(req, res);
  } else if (req.method === 'GET' && req.url === '/resources/documents') {
    handleDocuments(req, res);
  } else if (req.method === 'GET' && req.url === '/resources/images') {
    handleImages(req, res);
  } else if (req.method === 'GET' && req.url === '/resources/videos') {
    handleVideos(req, res);
  } else if (req.method === 'GET' && req.url.startsWith('/resources/recommendations')) {
    handleRecommendations(req, res);
  } else if (req.method === 'GET' && req.url.startsWith('/resources/search')) {
    handleSearch(req, res);
  } else if (req.url.startsWith('/user/preferences')) {
    verifyJWT(req, res, (user) => handlePreferences(req, res, user));

  } else {
    res.writeHead(404, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ error: 'Not found' }));
  }
});

server.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});