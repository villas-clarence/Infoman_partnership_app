<?php
$host = "localhost";
$user = "root";
$password = "";
$dbname = "aniya_database";

$conn = new mysqli($host, $user, $password, $dbname);
if ($conn->connect_error) {
    die(json_encode(["error" => "Connection failed: " . $conn->connect_error]));
}

$registrant_id = $_GET['id'] ?? null;
if (!$registrant_id) {
    http_response_code(400);
    echo json_encode(["error" => "No ID provided."]);
    exit();
}

$stmt = $conn->prepare("SELECT * FROM registrants WHERE registrant_id = ?");
$stmt->bind_param("i", $registrant_id);
$stmt->execute();
$result = $stmt->get_result();
$data = $result->fetch_assoc();

if (!$data) {
    http_response_code(404);
    echo json_encode(["error" => "Registrant not found."]);
    exit();
}

header("Content-Type: application/json");
echo json_encode($data);
exit();
?>
