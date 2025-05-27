<?php
header('Content-Type: application/json');
require_once __DIR__ . '/../../includes/database.php';
require_once __DIR__ . '/../../includes/auth.php';

$db = Database::getInstance()->getConnection();
$method = $_SERVER['REQUEST_METHOD'];

switch ($method) {
    case 'GET':
        $topic = $_GET['topic'] ?? '';
        $sql   = "SELECT * FROM resources WHERE type='videos' AND topic LIKE :topic";
        $stmt  = $db->prepare($sql);
        $stmt->bindValue(':topic', "%{$topic}%", PDO::PARAM_STR);
        $stmt->execute();
        $videos = $stmt->fetchAll(PDO::FETCH_ASSOC);
        echo json_encode($videos);
        break;

    case 'POST':
        $data = json_decode(file_get_contents('php://input'), true);
        $sql  = "INSERT INTO resources (type, title, url, topic, visibility)
                 VALUES ('videos', :title, :url, :topic, :visibility)";
        $stmt = $db->prepare($sql);
        $stmt->bindValue(':title',      $data['title']      ?? '',        PDO::PARAM_STR);
        $stmt->bindValue(':url',        $data['url']        ?? '',        PDO::PARAM_STR);
        $stmt->bindValue(':topic',      $data['topic']      ?? 'general', PDO::PARAM_STR);
        $stmt->bindValue(':visibility', $data['visibility'] ?? 'public',  PDO::PARAM_STR);
        $stmt->execute();
        echo json_encode(['success' => true, 'message' => 'Video inserat']);
        break;

    case 'PUT':
        parse_str(file_get_contents('php://input'), $update);
        $sql = "UPDATE resources SET
                    title      = :title,
                    url        = :url,
                    topic      = :topic,
                    visibility = :visibility
                WHERE id = :id AND type='videos'";
        $stmt = $db->prepare($sql);
        $stmt->bindValue(':id',         $update['id']         ?? 0,         PDO::PARAM_INT);
        $stmt->bindValue(':title',      $update['title']      ?? '',        PDO::PARAM_STR);
        $stmt->bindValue(':url',        $update['url']        ?? '',        PDO::PARAM_STR);
        $stmt->bindValue(':topic',      $update['topic']      ?? 'general', PDO::PARAM_STR);
        $stmt->bindValue(':visibility', $update['visibility'] ?? 'public',  PDO::PARAM_STR);
        $stmt->execute();
        echo json_encode(['success' => true, 'message' => 'Video actualizat']);
        break;

    case 'DELETE':
        parse_str(file_get_contents('php://input'), $del);
        $sql = "DELETE FROM resources WHERE id = :id AND type='videos'";
        $stmt = $db->prepare($sql);
        $stmt->bindValue(':id', $del['id'] ?? 0, PDO::PARAM_INT);
        $stmt->execute();
        $count = $stmt->rowCount();
        echo json_encode(['success' => true, 'deleted_rows' => $count]);
        break;

    default:
        http_response_code(405);
        echo json_encode(['success' => false, 'message' => 'Metodă neacceptată']);
};