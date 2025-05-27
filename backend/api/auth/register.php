<?php

header('Content-Type: application/json');
require_once __DIR__ . '/../../../includes/database.php';

$data = json_decode(file_get_contents('php://input'), true);
$username = $data['username'] ?? '';
$password = $data['password'] ?? '';

$db = Database::getInstance()->getConnection();
$stmt = $db->prepare('SELECT COUNT(*) AS cnt FROM users WHERE username=:uname');
$stmt->bindValue(':uname', $username, SQLITE3_TEXT);
$count = $stmt->execute()->fetchArray(SQLITE3_ASSOC)['cnt'];

if ($count > 0) {
    echo json_encode(['success' => false, 'message' => 'Username deja existent']);
    exit;
}

$hash = password_hash($password, PASSWORD_DEFAULT);
$stmt = $db->prepare('INSERT INTO users(username, password_hash, role) VALUES(:u, :p, "user")');
$stmt->bindValue(':u', $username, SQLITE3_TEXT);
$stmt->bindValue(':p', $hash, SQLITE3_TEXT);
$stmt->execute();

echo json_encode(['success' => true, 'message' => 'Înregistrare reușită']);
