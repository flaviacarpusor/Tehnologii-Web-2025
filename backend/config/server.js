const http = require('http');
const handleRegister = require('../routes/auth/register');
const handleLogin = require('../routes/auth/login');
const handleLogout = require('../routes/auth/logout');
const verifyJWT = require('../middleware/auth');

const PORT = process.env.PORT || 3000;

function withAuth(handler) {
  return (req, res) => {
    verifyJWT(req, res, () => handler(req, res));
  };
}

const server = http.createServer((req, res) => {
  if (req.method === 'POST' && req.url === '/register') {
    handleRegister(req, res);
  } else if (req.method === 'POST' && req.url === '/login') {
    handleLogin(req, res);
  } else if (req.method === 'POST' && req.url === '/logout') {
    withAuth(handleLogout)(req, res);
  } else {
    res.writeHead(404, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ error: 'Not found' }));
  }
});

server.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});