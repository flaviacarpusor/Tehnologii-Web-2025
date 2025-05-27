<?php
require_once __DIR__ . '/includes/database.php';

$db = Database::getInstance()->getConnection();
$stmt = $db->query('SELECT NOW() AS now');
$row = $stmt->fetch(PDO::FETCH_ASSOC);
echo 'Baza de date răspunde la: ' . $row['now'];
