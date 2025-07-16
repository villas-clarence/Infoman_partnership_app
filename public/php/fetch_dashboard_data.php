<?php
$host = "localhost";
$user = "root";
$password = "";
$database = "aniya_database";

$conn = new mysqli($host, $user, $password, $database);
mysqli_report(MYSQLI_REPORT_ERROR | MYSQLI_REPORT_STRICT);

if ($conn->connect_error) {
    http_response_code(500);
    echo json_encode(["error" => "Connection failed: " . $conn->connect_error]);
    exit();
}

header('Content-Type: application/json');

try {
    // Fetch all registrants with their custom_id
    $stmt = $conn->prepare("SELECT registrant_id, custom_id, full_name, email, mobile FROM registrants ORDER BY created_at DESC");
    $stmt->execute();
    $result = $stmt->get_result();

    $registrants = [];
    while ($row = $result->fetch_assoc()) {
        $registrants[] = [
            'registrant_id' => $row['registrant_id'],
            'custom_id' => $row['custom_id'],
            'full_name' => $row['full_name'],
            'email' => $row['email'],
            'mobile' => $row['mobile']
        ];
    }

    $stmt->close();
    echo json_encode($registrants);

} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(["error" => "Database error: " . $e->getMessage()]);
}

$conn->close();
?>