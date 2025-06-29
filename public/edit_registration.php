<?php
$host = "localhost";
$user = "root";
$password = "";
$dbname = "aniya_database";

$conn = new mysqli($host, $user, $password, $dbname);
if ($conn->connect_error) {
    die("Connection failed: " . $conn->connect_error);
}

$registrant_id = $_GET['id'] ?? null;
if (!$registrant_id) die("No ID provided.");

$stmt = $conn->prepare("SELECT * FROM registrants WHERE registrant_id = ?");
$stmt->bind_param("i", $registrant_id);
$stmt->execute();
$result = $stmt->get_result();
$data = $result->fetch_assoc();
if (!$data) die("Registrant not found.");

header("Content-Type: application/json");
echo json_encode($data);
exit();