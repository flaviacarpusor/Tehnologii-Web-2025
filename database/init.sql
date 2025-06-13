CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    username VARCHAR(100) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    email VARCHAR(150) UNIQUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    role VARCHAR(10) CHECK(role IN ('user', 'admin')) DEFAULT 'user'
);

CREATE TABLE resources (
    id SERIAL PRIMARY KEY,
    type VARCHAR(20) CHECK(type IN ('news', 'video', 'image', 'document')),
    title VARCHAR(500) NOT NULL,
    url TEXT NOT NULL UNIQUE,
    description TEXT,
    topic VARCHAR(100),
    visibility VARCHAR(10) CHECK(visibility IN ('public', 'admin')) DEFAULT 'public',
    source_id INTEGER,
    import_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    view_count INTEGER DEFAULT 0,
    keywords TEXT,
    FOREIGN KEY (source_id) REFERENCES user_sources(id) ON DELETE SET NULL
);


CREATE TABLE user_preferences (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id),
  resource_type VARCHAR(20),
  topic VARCHAR(100)
);

CREATE INDEX idx_resources_topic ON resources(topic);
CREATE INDEX idx_resources_type ON resources(type);
CREATE INDEX idx_resources_visibility ON resources(visibility);
CREATE INDEX idx_preferences_user ON user_preferences(user_id);
