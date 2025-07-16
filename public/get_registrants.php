<?php
// get_registrants.php
$mysqli = new mysqli("localhost", "root", "", "aniya_database");

if ($mysqli->connect_errno) {
  http_response_code(500);
  echo json_encode(["error" => "Database connection failed."]);
  exit;
}

$query = "SELECT registrant_id, full_name, custom_id FROM registrants ORDER BY full_name ASC";
$result = $mysqli->query($query);

$users = [];
while ($row = $result->fetch_assoc()) {
  $users[] = $row;
}

header('Content-Type: application/json');
echo json_encode($users);
?>
