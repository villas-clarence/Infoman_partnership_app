<?php
header("Content-Type: application/json");

$conn = new mysqli("localhost", "root", "", "aniya_database");
if ($conn->connect_error) {
  http_response_code(500);
  echo json_encode(["success" => false, "error" => "Connection failed"]);
  exit();
}

$registrant_id = intval($_POST['registrant_id'] ?? 0);
if ($registrant_id === 0) {
  echo json_encode(["success" => false, "error" => "Invalid registrant ID"]);
  exit();
}

// Prepare and execute delete statements for related tables
$tables = ['registrant_crops', 'registrant_livestock', 'registrant_packages', 'registrants'];

foreach ($tables as $table) {
  $stmt = $conn->prepare("DELETE FROM $table WHERE registrant_id = ?");
  if (!$stmt) {
    echo json_encode(["success" => false, "error" => "Prepare failed for $table: " . $conn->error]);
    exit();
  }
  $stmt->bind_param("i", $registrant_id);
  if (!$stmt->execute()) {
    echo json_encode(["success" => false, "error" => "Execution failed for $table: " . $stmt->error]);
    $stmt->close();
    exit();
  }
  $stmt->close();
}

echo json_encode(["success" => true, "message" => "Registrant and related data deleted successfully"]);

$conn->close();
