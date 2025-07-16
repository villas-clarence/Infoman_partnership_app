<?php
header('Content-Type: application/json');

// DB connection
$host = "localhost";
$user = "root";
$pass = "";
$db = "aniya_database";

$conn = new mysqli($host, $user, $pass, $db);
if ($conn->connect_error) {
    http_response_code(500);
    echo json_encode(["error" => "Database connection failed"]);
    exit;
}

$statusFilter = isset($_GET['status']) ? $_GET['status'] : 'all';

// Build query
$sql = "SELECT q.update_id, q.registrant_id, q.update_date, q.notes, q.photo_urls, q.status, q.remarks, r.full_name
        FROM quarterly_updates q
        JOIN registrants r ON q.registrant_id = r.registrant_id";

if ($statusFilter !== 'all') {
    $sql .= " WHERE q.status = ?";
    $stmt = $conn->prepare($sql);
    $stmt->bind_param("s", $statusFilter);
} else {
    $stmt = $conn->prepare($sql);
}

$stmt->execute();
$result = $stmt->get_result();

$updates = [];
while ($row = $result->fetch_assoc()) {
    $updates[] = $row;
}

echo json_encode($updates);
$stmt->close();
$conn->close();
