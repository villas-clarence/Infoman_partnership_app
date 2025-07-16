<?php
session_start();
require_once 'configuration.php';

header('Content-Type: application/json');

// Check if logged in
if (!isset($_SESSION['user_id'])) {
    http_response_code(401);
    echo json_encode(['error' => 'Not logged in']);
    exit;
}

$user_id = $_SESSION['user_id'];

// Fetch the registrant info via matching email between `users` and `registrants`
$stmt = $conn->prepare("
    SELECT r.registrant_id, r.custom_id, r.full_name, r.certificate_name, r.created_at
    FROM registrants r
    JOIN users u ON r.email = u.email
    WHERE u.id = ?
");
$stmt->bind_param("i", $user_id);
$stmt->execute();
$result = $stmt->get_result();

if ($result->num_rows === 0) {
    echo json_encode(['error' => 'No registrant found']);
    exit;
}

$registrant = $result->fetch_assoc();

// Fetch quarterly updates
$stmt2 = $conn->prepare("SELECT update_date, notes, photo_urls, status FROM quarterly_updates WHERE registrant_id = ?");
$stmt2->bind_param("i", $registrant['registrant_id']);
$stmt2->execute();
$res2 = $stmt2->get_result();

$updates = [];
while ($row = $res2->fetch_assoc()) {
    $row['photo_urls'] = json_decode($row['photo_urls'], true) ?: [];
    $updates[] = $row;
}

echo json_encode([
    'success' => true,
    'registrant_id' => $registrant['registrant_id'],
    'custom_id' => $registrant['custom_id'],
    'full_name' => $registrant['full_name'],
    'certificate_name' => $registrant['certificate_name'],
    'tree_id' => 'ANIYA-' . $registrant['registrant_id'],
    'amount' => '2500.00', // Static, or retrieve from payments table
    'investment_date' => date('M d, Y', strtotime($registrant['created_at'])),
    'current_status' => end($updates)['status'] ?? 'Planted',
    'days_since' => floor((time() - strtotime($registrant['created_at'])) / 86400),
    'updates' => $updates
]);

