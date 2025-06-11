CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    username VARCHAR(100) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    email VARCHAR(150) UNIQUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    role VARCHAR(10) CHECK(role IN ('user', 'admin')) DEFAULT 'user'
);


CREATE TABLE user_sources (
    id SERIAL PRIMARY KEY,
    user_id INTEGER,
    source_url VARCHAR(500) NOT NULL,
    source_type VARCHAR(10) CHECK(source_type IN ('rss', 'api', 'web')),
    source_name VARCHAR(200),
    active BOOLEAN DEFAULT true,
    last_import TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
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


CREATE TABLE user_interactions (
    id SERIAL PRIMARY KEY,
    user_id INTEGER,
    resource_id INTEGER,
    action VARCHAR(10) CHECK(action IN ('view', 'click', 'save', 'share')),
    timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (resource_id) REFERENCES resources(id) ON DELETE CASCADE
);


CREATE INDEX idx_resources_topic ON resources(topic);
CREATE INDEX idx_resources_type ON resources(type);
CREATE INDEX idx_interactions_user ON user_interactions(user_id);
CREATE INDEX idx_preferences_user ON user_preferences(user_id);
CREATE INDEX idx_resources_visibility ON resources(visibility);
CREATE INDEX idx_sources_active ON user_sources(active);
