const http = require('http');

function handleLogout(req, res) {
  
  res.writeHead(200, { 'Content-Type': 'application/json' });
  res.end(JSON.stringify({ message: `Logout reusit pentru userul cu id ${req.user?.userId || 'necunoscut'}` }));
}

module.exports = handleLogout;

