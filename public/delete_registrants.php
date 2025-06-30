<?php
$host = "localhost";
$user = "root";
$password = "";
$db = "aniya_database";

$conn = new mysqli($host, $user, $password, $db);
if ($conn->connect_error) {
    echo json_encode(['success' => false, 'error' => 'Connection failed']);
    exit();
}

$registrant_id = $_POST['registrant_id'];

$stmt = $conn->prepare("DELETE FROM registrants WHERE registrant_id = ?");
$stmt->bind_param("i", $registrant_id);

if ($stmt->execute()) {
    echo json_encode(['success' => true]);
} else {
    echo json_encode(['success' => false, 'error' => $stmt->error]);
}

$stmt->close();
$conn->close();
