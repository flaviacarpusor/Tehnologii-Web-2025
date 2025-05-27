<?php
header('Content-Type: application/json');
require_once __DIR__ . '/../../includes/database.php';
require_once __DIR__ . '/../../includes/auth.php';

$db = Database::getInstance()->getConnection();
$method = $_SERVER['REQUEST_METHOD'];

switch ($method) {
    case 'GET':
        $topic = $_GET['topic'] ?? '';
        $sql   = "SELECT * FROM resources WHERE type='documents' AND topic LIKE :topic";
        $stmt  = $db->prepare($sql);
        $stmt->bindValue(':topic', "%{$topic}%", PDO::PARAM_STR);
        $stmt->execute();
        $docsList = $stmt->fetchAll(PDO::FETCH_ASSOC);
        echo json_encode($docsList);
        break;

    case 'POST':
        $data = json_decode(file_get_contents('php://input'), true);
        $sql  = "INSERT INTO resources (type, title, url, topic, visibility)
                 VALUES ('documents', :title, :url, :topic, :visibility)";
        $stmt = $db->prepare($sql);
        $stmt->bindValue(':title',      $data['title']      ?? '',        PDO::PARAM_STR);
        $stmt->bindValue(':url',        $data['url']        ?? '',        PDO::PARAM_STR);
        $stmt->bindValue(':topic',      $data['topic']      ?? 'general', PDO::PARAM_STR);
        $stmt->bindValue(':visibility', $data['visibility'] ?? 'public',  PDO::PARAM_STR);
        $stmt->execute();
        echo json_encode(['success' => true, 'message' => 'Document inserat']);
        break;

    case 'PUT':
        parse_str(file_get_contents('php://input'), $update);
        $sql = "UPDATE resources SET
                    title      = :title,
                    url        = :url,
                    topic      = :topic,
                    visibility = :visibility
                WHERE id = :id AND type='documents'";
        $stmt = $db->prepare($sql);
        $stmt->bindValue(':id',         $update['id']         ?? 0,         PDO::PARAM_INT);
        $stmt->bindValue(':title',      $update['title']      ?? '',        PDO::PARAM_STR);
        $stmt->bindValue(':url',        $update['url']        ?? '',        PDO::PARAM_STR);
        $stmt->bindValue(':topic',      $update['topic']      ?? 'general', PDO::PARAM_STR);
        $stmt->bindValue(':visibility', $update['visibility'] ?? 'public',  PDO::PARAM_STR);
        $stmt->execute();
        echo json_encode(['success' => true, 'message' => 'Document actualizat']);
        break;

    case 'DELETE':
        parse_str(file_get_contents('php://input'), $del);
        $sql = "DELETE FROM resources WHERE id = :id AND type='documents'";
        $stmt = $db->prepare($sql);
        $stmt->bindValue(':id', $del['id'] ?? 0, PDO::PARAM_INT);
        $stmt->execute();
        echo json_encode(['success' => true, 'message' => 'Document șters']);
        break;

    default:
        http_response_code(405);
        echo json_encode(['success' => false, 'message' => 'Metodă neacceptată']);
};