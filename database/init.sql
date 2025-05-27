
CREATE TABLE IF NOT EXISTS users (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  username TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  role TEXT CHECK(role IN ('user','admin')) DEFAULT 'user'
);

CREATE TABLE IF NOT EXISTS resources (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  type TEXT,
  title TEXT NOT NULL,
  url TEXT,
  description TEXT,
  topic TEXT,
  visibility TEXT CHECK(visibility IN ('public','admin')) DEFAULT 'public'
);
