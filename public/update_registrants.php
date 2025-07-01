<?php
// update_registration.php

header("Content-Type: application/json");

$conn = new mysqli("localhost", "root", "", "aniya_database");
if ($conn->connect_error) {
  http_response_code(500);
  echo json_encode(["error" => "Connection failed"]);
  exit();
}

$data = json_decode(file_get_contents("php://input"), true);
if (!$data || !isset($data['registrant_id'])) {
  echo json_encode(["error" => "Invalid input"]);
  exit();
}

$id = intval($data['registrant_id']);
$full_name = $conn->real_escape_string($data['full_name'] ?? '');
$email = $conn->real_escape_string($data['email'] ?? '');
$mobile = $conn->real_escape_string($data['mobile'] ?? '');
$company = $conn->real_escape_string($data['company_name'] ?? '');
$role = $conn->real_escape_string($data['role'] ?? '');
$package_id = intval($data['package_id'] ?? 0);
$tree_count = intval($data['tree_count'] ?? 0);
$crops = $data['crops'] ?? [];
$livestock = $data['livestock'] ?? [];

$conn->query("UPDATE registrants SET full_name='$full_name', email='$email', mobile='$mobile', company_name='$company', role='$role' WHERE registrant_id=$id");
$conn->query("UPDATE registrant_packages SET package_id=$package_id, tree_count=$tree_count WHERE registrant_id=$id");

$conn->query("DELETE FROM registrant_crops WHERE registrant_id=$id");
foreach ($crops as $crop_id) {
  $crop_id = intval($crop_id);
  $conn->query("INSERT INTO registrant_crops (registrant_id, crop_id) VALUES ($id, $crop_id)");
}

$conn->query("DELETE FROM registrant_livestock WHERE registrant_id=$id");
foreach ($livestock as $livestock_id) {
  $livestock_id = intval($livestock_id);
  $conn->query("INSERT INTO registrant_livestock (registrant_id, livestock_id) VALUES ($id, $livestock_id)");
}

echo json_encode(["message" => "Registrant updated"]);
$conn->close();

