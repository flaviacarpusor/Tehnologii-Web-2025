const http = require('http');
const handleRegister = require('../routes/auth/register');
const handleLogin = require('../routes/auth/login');
const handleLogout = require('../routes/auth/logout');
const { verifyJWT } = require('../middleware/auth');
const handleRecommendations = require('../routes/resources/recommendations');
const { handlePreferences } = require('../routes/user/preferences');
const handleProfile = require('../routes/user/profile');
const handleChangePassword = require('../routes/user/changePassw');
const handleExport = require('../routes/admin/export');
const handleImport = require('../routes/admin/import');
const handleAdminResources = require('../routes/admin/resources');
const handleAdminUsers = require('../routes/admin/users');
const handleAllResources = require('../routes/resources/all');
const { handleForgotPassword } = require('../routes/auth/forgotPassword');
const handleFilteredRss = require('../routes/rss');

const PORT = process.env.PORT || 3000;

function withAuth(handler) {
  return (req, res) => {
    verifyJWT(req, res, () => handler(req, res));
  };
}

const server = http.createServer((req, res) => {
  // CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    res.writeHead(204);
    return res.end();
  }

  // --- AUTH ---
  if (req.method === 'POST' && req.url === '/auth/register') {
    handleRegister(req, res);
  } else if (req.method === 'POST' && req.url === '/auth/login') {
    handleLogin(req, res);
  } else if (req.method === 'POST' && req.url === '/auth/logout') {
    withAuth(handleLogout)(req, res);
  // --- RESETARE PAROLA ---
  } else if (req.method === 'POST' && req.url === '/auth/forgot-password') {
    handleForgotPassword(req, res);

  // --- RESOURCES ---
  } else if (req.method === 'GET' && req.url.startsWith('/resources/recommendations')) {
    verifyJWT(req, res, (user) => handleRecommendations(req, res, user));
  } else if (req.url.startsWith('/resources/all')) {
    return handleAllResources(req, res);
  } else if (req.method === 'GET' && req.url.startsWith('/resources/rss')) {
    handleFilteredRss(req, res);
  }
  // --- PROFILE ---
    else if (req.url.startsWith('/user/preferences')) {
    verifyJWT(req, res, (user) => handlePreferences(req, res, user));
  } else if (req.method === 'GET' && req.url === '/user/profile') {
    verifyJWT(req, res, (user) => handleProfile(req, res, user));
  } else if (req.method === 'POST' && req.url === '/user/change-password') {
    verifyJWT(req, res, (user) => handleChangePassword(req, res, user));
  }
  // --- ADMIN ---
   else if (req.method === 'GET' && req.url.startsWith('/admin/export')) {
    verifyJWT(req, res, (user) => handleExport(req, res, user));
  } else if (req.method === 'POST' && req.url === '/admin/import') {
    verifyJWT(req, res, (user) => handleImport(req, res, user));
  } else if (req.url.startsWith('/admin/resources')) {
    verifyJWT(req, res, (user) => handleAdminResources(req, res, user));
  } else if (req.url.startsWith('/admin/users')) {
    verifyJWT(req, res, (user) => handleAdminUsers(req, res, user));
  } else {
    res.writeHead(404, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ error: 'Not found' }));
  }
});

server.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});