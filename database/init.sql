CREATE TABLE IF NOT EXISTS users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(100) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    role ENUM('user', 'admin') DEFAULT 'user'
);

CREATE TABLE IF NOT EXISTS resources (
    id INT AUTO_INCREMENT PRIMARY KEY,
    type VARCHAR(50),
    title VARCHAR(255) NOT NULL,
    url TEXT,
    description TEXT,
    topic VARCHAR(100),
    visibility ENUM('public', 'admin') DEFAULT 'public'
);
