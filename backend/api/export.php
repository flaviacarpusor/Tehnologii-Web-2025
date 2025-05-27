<?php
header('Content-Type: application/json');
require_once __DIR__ . '/../includes/database.php';

$type = $_GET['type'] ?? 'news';
$format = $_GET['format'] ?? 'json'; // 'csv' or 'json'

$db = Database::getInstance()->getConnection();
$sql = "SELECT * FROM resources WHERE type=:type";
$stmt = $db->prepare($sql);
$stmt->bindValue(':type', $type, SQLITE3_TEXT);
$result = $stmt->execute();

$resources = [];
while ($row = $result->fetchArray(SQLITE3_ASSOC)) {
    $resources[] = $row;
}

if ($format === 'csv') {
    header('Content-Type: text/csv');
    header('Content-Disposition: attachment; filename="export.csv"');
    $output = fopen('php://output','w');
    // Head
    fputcsv($output, array_keys($resources[0] ?? []));
    // Body
    foreach ($resources as $res) {
       fputcsv($output, $res);
    }
    fclose($output);
    exit;
}

// Implicit JSON
echo json_encode($resources);
