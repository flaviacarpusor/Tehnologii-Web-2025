
CREATE TABLE IF NOT EXISTS users (
  id                INTEGER PRIMARY KEY AUTOINCREMENT,
  username          TEXT    UNIQUE NOT NULL,
  password_hash     TEXT    NOT NULL,
  email             TEXT    UNIQUE NOT NULL,
  is_admin          INTEGER DEFAULT 0,                  -- 0 = user normal, 1 = administrator
  registration_date DATETIME DEFAULT CURRENT_TIMESTAMP
);


CREATE TABLE IF NOT EXISTS resources (
  id           INTEGER PRIMARY KEY AUTOINCREMENT,
  title        TEXT    NOT NULL,
  url          TEXT    NOT NULL,
  description  TEXT,
  category     TEXT,
  source       TEXT,
  image_url    TEXT,
  content_type TEXT,
  created_at   DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS user_preferences (
  user_id  INTEGER NOT NULL,
  category TEXT    NOT NULL,
  PRIMARY KEY (user_id, category),
  FOREIGN KEY (user_id) REFERENCES users(id)
);

-- surse predefinite / user-defined
CREATE TABLE IF NOT EXISTS sources (
  id        INTEGER PRIMARY KEY AUTOINCREMENT,
  category  TEXT    NOT NULL,
  url       TEXT    NOT NULL UNIQUE
);
