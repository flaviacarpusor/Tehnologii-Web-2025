<?php

header('Content-Type: application/json');
require_once __DIR__ . '/../../../includes/database.php';
require_once __DIR__ . '/../../../includes/auth.php';  // pentru a verifica sesiunea, dacă e cazul


$db = Database::getInstance()->getConnection();
$topic = $_GET['topic'] ?? '';

// SELECT simplu
$sql = "SELECT * FROM resources WHERE type='recommandations' AND topic LIKE :topic AND visibility='public'";
$stmt = $db->prepare($sql);
$stmt->bindValue(':topic', "%$topic%", SQLITE3_TEXT);
$result = $stmt->execute();

$newsList = [];
while ($row = $result->fetchArray(SQLITE3_ASSOC)) {
    $newsList[] = $row;
}
echo json_encode($newsList);
