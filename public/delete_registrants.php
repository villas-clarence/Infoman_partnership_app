<?php
$mysqli = new mysqli("localhost", "root", "", "aniya_database");
if ($mysqli->connect_error) {
    http_response_code(500);
    echo json_encode(["error" => "DB connection failed"]);
    exit;
}

$id = intval($_POST['id'] ?? 0);
if ($id <= 0) {
    echo json_encode(["error" => "Invalid ID"]);
    exit;
}

$stmt = $mysqli->prepare("DELETE FROM registrants WHERE registrant_id = ?");
$stmt->bind_param("i", $id);
if ($stmt->execute()) {
    echo json_encode(["success" => true]);
} else {
    echo json_encode(["error" => $stmt->error]);
}
?>
