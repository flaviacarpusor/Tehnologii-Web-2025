<?php

session_start();
header('Content-Type: application/json');

require_once __DIR__ . '/../../../includes/database.php';

$data = json_decode(file_get_contents('php://input'), true);
$username = $data['username'] ?? '';
$password = $data['password'] ?? '';

$db = Database::getInstance()->getConnection();
$stmt = $db->prepare('SELECT * FROM users WHERE username = :uname');
$stmt->bindValue(':uname', $username, SQLITE3_TEXT);
$result = $stmt->execute();
$user = $result->fetchArray(SQLITE3_ASSOC);

if (!$user) {
    echo json_encode(['success' => false, 'message' => 'User inexistent']);
    exit;
}
if (!password_verify($password, $user['password_hash'])) {
    echo json_encode(['success' => false, 'message' => 'Parolă incorectă']);
    exit;
}

// Totul e OK
$_SESSION['user_id'] = $user['id'];
$_SESSION['role'] = $user['role'];
echo json_encode(['success' => true, 'message' => 'Login reușit']);
