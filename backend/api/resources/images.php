<?php
header('Content-Type: application/json');
require_once __DIR__ . '/../../../includes/database.php';
require_once __DIR__ . '/../../../includes\auth.php'; // dacă vrei să verifici sesiunea/admin

$db = Database::getInstance()->getConnection();
$method = $_SERVER['REQUEST_METHOD'];

switch ($method) {
    case 'GET':
        // Citește toate imaginile (și le filtrează după "topic" dacă există)
        $topic = $_GET['topic'] ?? '';
        $sql = "SELECT * FROM resources WHERE type='images' AND topic LIKE :topic";
        $stmt = $db->prepare($sql);
        $stmt->bindValue(':topic', "%$topic%", SQLITE3_TEXT);
        $result = $stmt->execute();

        $imagesList = [];
        while ($row = $result->fetchArray(SQLITE3_ASSOC)) {
            $imagesList[] = $row;
        }
        echo json_encode($imagesList);
        break;

    case 'POST':
        // Creează / inserează o nouă resursă de tip "images"
        $data = json_decode(file_get_contents('php://input'), true);
        $title = $data['title'] ?? '';
        $url = $data['url'] ?? '';
        $topic = $data['topic'] ?? 'general';
        $visibility = $data['visibility'] ?? 'public';

        $insertSql = "INSERT INTO resources(type, title, url, topic, visibility)
                      VALUES('images', :title, :url, :topic, :visibility)";
        $insertStmt = $db->prepare($insertSql);
        $insertStmt->bindValue(':title', $title, SQLITE3_TEXT);
        $insertStmt->bindValue(':url', $url, SQLITE3_TEXT);
        $insertStmt->bindValue(':topic', $topic, SQLITE3_TEXT);
        $insertStmt->bindValue(':visibility', $visibility, SQLITE3_TEXT);
        $insertStmt->execute();

        echo json_encode(['success' => true, 'message' => 'Imagine adăugată']);
        break;

    case 'PUT':
        // Actualizează o resursă existentă (așteaptă un "id")
        parse_str(file_get_contents("php://input"), $_PUT); 
        // ^ Dacă preferi JSON:
        // $data = json_decode(file_get_contents('php://input'), true);
        
        $id = $_PUT['id'] ?? null;
        $title = $_PUT['title'] ?? '';
        $url = $_PUT['url'] ?? '';
        $topic = $_PUT['topic'] ?? 'general';
        $visibility = $_PUT['visibility'] ?? 'public';

        if (!$id) {
            echo json_encode(['success' => false, 'message' => 'Lipsește ID-ul imaginii']);
            exit;
        }
        $updateSql = "UPDATE resources SET title=:title, url=:url, topic=:topic,
                      visibility=:visibility WHERE id=:id AND type='images'";
        $updateStmt = $db->prepare($updateSql);
        $updateStmt->bindValue(':title', $title, SQLITE3_TEXT);
        $updateStmt->bindValue(':url', $url, SQLITE3_TEXT);
        $updateStmt->bindValue(':topic', $topic, SQLITE3_TEXT);
        $updateStmt->bindValue(':visibility', $visibility, SQLITE3_TEXT);
        $updateStmt->bindValue(':id', $id, SQLITE3_INTEGER);
        $updateStmt->execute();

        echo json_encode(['success' => true, 'message' => 'Imagine actualizată']);
        break;

    case 'DELETE':
        // Șterge o resursă (așteaptă un "id")
        parse_str(file_get_contents("php://input"), $_DELETE);
        $id = $_DELETE['id'] ?? null;

        if (!$id) {
            echo json_encode(['success' => false, 'message' => 'Lipsește ID-ul imaginii']);
            exit;
        }
        $deleteSql = "DELETE FROM resources WHERE id=:id AND type='images'";
        $deleteStmt = $db->prepare($deleteSql);
        $deleteStmt->bindValue(':id', $id, SQLITE3_INTEGER);
        $deleteStmt->execute();

        echo json_encode(['success' => true, 'message' => 'Imagine ștearsă']);
        break;

    default:
        http_response_code(405);
        echo json_encode(['success' => false, 'message' => 'Metoda neacceptată']);
}
