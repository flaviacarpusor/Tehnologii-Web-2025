<?php
header('Content-Type: application/json');
require_once __DIR__ . '/../../includes/database.php';
require_once __DIR__ . '/../../includes/auth.php';

$db = Database::getInstance()->getConnection();
$method = $_SERVER['REQUEST_METHOD'];

switch ($method) {
    case 'GET':
        $topic = $_GET['topic'] ?? '';
        $sql   = "SELECT * FROM resources WHERE type='news' AND topic LIKE :topic AND visibility='public'";
        $stmt  = $db->prepare($sql);
        $stmt->bindValue(':topic', "%{$topic}%", PDO::PARAM_STR);
        $stmt->execute();
        $newsList = $stmt->fetchAll(PDO::FETCH_ASSOC);
        echo json_encode($newsList);
        break;

    case 'POST':
        $data = json_decode(file_get_contents('php://input'), true);
        $sql  = "INSERT INTO resources (type, title, url, topic, visibility)
                 VALUES ('news', :title, :url, :topic, :visibility)";
        $stmt = $db->prepare($sql);
        $stmt->bindValue(':title',      $data['title']      ?? '',        PDO::PARAM_STR);
        $stmt->bindValue(':url',        $data['url']        ?? '',        PDO::PARAM_STR);
        $stmt->bindValue(':topic',      $data['topic']      ?? 'general', PDO::PARAM_STR);
        $stmt->bindValue(':visibility', $data['visibility'] ?? 'public',  PDO::PARAM_STR);
        $stmt->execute();
        echo json_encode(['success' => true, 'message' => 'Știre inserată']);
        break;

    case 'PUT':
        parse_str(file_get_contents('php://input'), $update);
        $sql = "UPDATE resources SET
                    title      = :title,
                    url        = :url,
                    topic      = :topic,
                    visibility = :visibility
                WHERE id = :id AND type='news'";
        $stmt = $db->prepare($sql);
        $stmt->bindValue(':id',         $update['id']         ?? 0,         PDO::PARAM_INT);
        $stmt->bindValue(':title',      $update['title']      ?? '',        PDO::PARAM_STR);
        $stmt->bindValue(':url',        $update['url']        ?? '',        PDO::PARAM_STR);
        $stmt->bindValue(':topic',      $update['topic']      ?? 'general', PDO::PARAM_STR);
        $stmt->bindValue(':visibility', $update['visibility'] ?? 'public',  PDO::PARAM_STR);
        $stmt->execute();
        echo json_encode(['success' => true, 'message' => 'Știre actualizată']);
        break;

    case 'DELETE':
        parse_str(file_get_contents('php://input'), $del);
        $sql = "DELETE FROM resources WHERE id = :id AND type='news'";
        $stmt = $db->prepare($sql);
        $stmt->bindValue(':id', $del['id'] ?? 0, PDO::PARAM_INT);
        $stmt->execute();
        echo json_encode(['success' => true, 'message' => 'Știre ștearsă']);
        break;

    default:
        http_response_code(405);
        echo json_encode(['success' => false, 'message' => 'Metodă neacceptată']);
};
