const http = require('http');
const handleRegister = require('../routes/auth/register');
const handleLogin = require('../routes/auth/login');
const handleLogout = require('../routes/auth/logout');
const { verifyJWT } = require('../middleware/auth');
const { verifyAdmin } = require('../middleware/admin');
const handleNews = require('../routes/resources/news');
const handleDocuments = require('../routes/resources/documents');
const handleImages = require('../routes/resources/images');
const handleVideos = require('../routes/resources/videos');
const handleRecommendations = require('../routes/resources/recommendations');
const handleSearch = require('../routes/resources/search');
const handlePreferences = require('../routes/user/preferences');
const handleProfile = require('../routes/user/profile');
const handleChangePassword = require('../routes/user/changePassw');
const handleExport = require('../routes/admin/export');
const handleImport = require('../routes/admin/import');
const handleAdminResources = require('../routes/admin/resources');
const handleAdminUsers = require('../routes/admin/users');
const { updateInteraction } = require('../routes/user/interactions');
const handleRss = require('../routes/rss');
const handleAllResources = require('../routes/resources/all');

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
    verifyJWT(req, res, (user) => handleRecommendations(req, res, user));
  } else if (req.method === 'GET' && req.url.startsWith('/resources/search')) {
    handleSearch(req, res);
  } else if (req.url.startsWith('/user/preferences')) {
    verifyJWT(req, res, (user) => handlePreferences(req, res, user));
    // --- PROFILE ---
  } else if (req.method === 'GET' && req.url === '/user/profile') {
    verifyJWT(req, res, (user) => handleProfile(req, res, user));
  } else if (req.method === 'POST' && req.url === '/user/change-password') {
    verifyJWT(req, res, (user) => handleChangePassword(req, res, user));
  } else if (req.method === 'POST' && req.url === '/user/preferences/update-weight') {
    verifyJWT(req, res, () => {
      updatePreferenceWeight(req, res);
    });
  } else if (req.method === 'POST' && req.url === '/user/interactions/update') {
    verifyJWT(req, res, () => {
      updateInteraction(req, res);
    });
    // --- SOURCES---

  // --- ADMIN ---
  } else if (req.method === 'GET' && req.url === '/admin/export') {
    verifyJWT(req, res, (user) => handleExport(req, res, user));
  } else if (req.method === 'POST' && req.url === '/admin/import') {
    verifyJWT(req, res, (user) => handleImport(req, res, user));
  } else if (req.url.startsWith('/admin/resources')) {
    verifyJWT(req, res, (user) => handleAdminResources(req, res, user));
  } else if (req.url.startsWith('/admin/users')) {
    verifyJWT(req, res, (user) => handleAdminUsers(req, res, user));
  } else if (req.url === '/admin/resources') {
    verifyJWT(req, res, () => {
      verifyAdmin(req, res, () => {
        // logica finala pentru /admin/resources
      });
    });

  } else if (req.method === 'GET' && req.url.startsWith('/resources/rss')) {
    handleRss(req, res);
  } else if (req.method === 'GET' && req.url === '/resources/all') {
    handleAllResources(req, res);
  } else {
    res.writeHead(404, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ error: 'Not found' }));
  }
});

server.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});