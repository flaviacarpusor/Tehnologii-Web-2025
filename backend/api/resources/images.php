<?php
header('Content-Type: application/json');
require_once __DIR__ . '/../../includes/database.php';
require_once __DIR__ . '/../../includes/auth.php';
$db = Database::getInstance()->getConnection();
$method = $_SERVER['REQUEST_METHOD'];

switch ($method) {
    case 'GET':
        $topic = $_GET['topic'] ?? '';
        $sql = "SELECT * FROM resources WHERE type = 'images' AND topic LIKE :topic";
        $stmt = $db->prepare($sql);
        $stmt->bindValue(':topic', "%{$topic}%", PDO::PARAM_STR);
        $stmt->execute();
        $imagesList = $stmt->fetchAll(PDO::FETCH_ASSOC);
        echo json_encode($imagesList);
        break;

    case 'POST':
        $data = json_decode(file_get_contents('php://input'), true);
        $title      = $data['title']      ?? '';
        $url        = $data['url']        ?? '';
        $topic      = $data['topic']      ?? 'general';
        $visibility = $data['visibility'] ?? 'public';

        $insertSql = "
            INSERT INTO resources (type, title, url, topic, visibility)
            VALUES ('images', :title, :url, :topic, :visibility)
        ";
        $insertStmt = $db->prepare($insertSql);
        $insertStmt->bindValue(':title',      $title,      PDO::PARAM_STR);
        $insertStmt->bindValue(':url',        $url,        PDO::PARAM_STR);
        $insertStmt->bindValue(':topic',      $topic,      PDO::PARAM_STR);
        $insertStmt->bindValue(':visibility', $visibility, PDO::PARAM_STR);
        $insertStmt->execute();

        echo json_encode(['success' => true, 'message' => 'Imagine adăugată']);
        break;

    case 'PUT':
        // Dacă preferi JSON: $data = json_decode(file_get_contents('php://input'), true);
        parse_str(file_get_contents("php://input"), $put);
        $id         = $put['id']         ?? null;
        $title      = $put['title']      ?? '';
        $url        = $put['url']        ?? '';
        $topic      = $put['topic']      ?? 'general';
        $visibility = $put['visibility'] ?? 'public';

        if (!$id) {
            http_response_code(400);
            echo json_encode(['success' => false, 'message' => 'Lipsește ID-ul imaginii']);
            exit;
        }

        $updateSql = "
            UPDATE resources
            SET title = :title,
                url = :url,
                topic = :topic,
                visibility = :visibility
            WHERE id = :id
              AND type = 'images'
        ";
        $updateStmt = $db->prepare($updateSql);
        $updateStmt->bindValue(':title',      $title,      PDO::PARAM_STR);
        $updateStmt->bindValue(':url',        $url,        PDO::PARAM_STR);
        $updateStmt->bindValue(':topic',      $topic,      PDO::PARAM_STR);
        $updateStmt->bindValue(':visibility', $visibility, PDO::PARAM_STR);
        $updateStmt->bindValue(':id',         $id,         PDO::PARAM_INT);
        $updateStmt->execute();

        echo json_encode(['success' => true, 'message' => 'Imagine actualizată']);
        break;

    case 'DELETE':
        parse_str(file_get_contents("php://input"), $del);
        $id = $del['id'] ?? null;

        if (!$id) {
            http_response_code(400);
            echo json_encode(['success' => false, 'message' => 'Lipsește ID-ul imaginii']);
            exit;
        }

        $deleteSql = "DELETE FROM resources WHERE id = :id AND type = 'images'";
        $deleteStmt = $db->prepare($deleteSql);
        $deleteStmt->bindValue(':id', $id, PDO::PARAM_INT);
        $deleteStmt->execute();

        echo json_encode(['success' => true, 'message' => 'Imagine ștearsă']);
        break;

    default:
        http_response_code(405);
        echo json_encode(['success' => false, 'message' => 'Metoda neacceptată']);
        break;
}
