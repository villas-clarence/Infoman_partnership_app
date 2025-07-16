<?php
// Enable CORS and JSON response
header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json");

// Start session
session_start();

// Debug: simulate session registrant_id for testing
// $_SESSION['registrant_id'] = 1;

if (!isset($_SESSION['registrant_id'])) {
    http_response_code(403);
    echo json_encode(["error" => "Unauthorized access. Please login."]);
    exit;
}

$registrant_id = $_SESSION['registrant_id'];

// DB connection
$host = "localhost";
$user = "root";
$pass = "";
$db = "aniya_database";

$conn = new mysqli($host, $user, $pass, $db);
if ($conn->connect_error) {
    http_response_code(500);
    echo json_encode(["error" => "Connection failed: " . $conn->connect_error]);
    exit;
}

// Get basic registrant data
$registrantSql = "SELECT r.registrant_id, r.full_name, r.custom_id, r.tree_count, p.package_name, py.amount_paid, py.payment_date
                  FROM registrants r
                  LEFT JOIN packages p ON r.package_id = p.package_id
                  LEFT JOIN payments py ON r.registrant_id = py.registrant_id
                  WHERE r.registrant_id = ?";
$stmt = $conn->prepare($registrantSql);
$stmt->bind_param("i", $registrant_id);
$stmt->execute();
$registrantResult = $stmt->get_result();
$registrant = $registrantResult->fetch_assoc();

if (!$registrant) {
    echo json_encode(["error" => "Registrant not found."]);
    exit;
}

// Get updates
$updateSql = "SELECT * FROM quarterly_updates WHERE registrant_id = ? ORDER BY update_date DESC";
$stmt2 = $conn->prepare($updateSql);
$stmt2->bind_param("i", $registrant_id);
$stmt2->execute();
$updateResult = $stmt2->get_result();

$updates = [];
$current_status = '';
$latest_date = '';

while ($row = $updateResult->fetch_assoc()) {
    $row['photo_urls'] = json_decode($row['photo_urls'] ?? '[]');
    $updates[] = $row;

    // Update current status if latest
    if (!$latest_date || $row['update_date'] > $latest_date) {
        $current_status = $row['status'];
        $latest_date = $row['update_date'];
    }
}

// Calculate days since first planting (assumes earliest update is planting)
$first_update = end($updates);
$first_date = isset($first_update['update_date']) ? $first_update['update_date'] : null;
$days_since = $first_date ? round((strtotime(date('Y-m-d')) - strtotime($first_date)) / (60 * 60 * 24)) : 0;

echo json_encode([
    "full_name" => $registrant['full_name'],
    "tree_id" => $registrant['custom_id'],
    "amount" => $registrant['amount_paid'] ?? 0,
    "investment_date" => $registrant['payment_date'] ?? "Unknown",
    "updates" => $updates,
    "current_status" => $current_status,
    "days_since" => $days_since
]);

$conn->close();
