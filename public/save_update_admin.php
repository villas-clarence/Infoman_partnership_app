<?php
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

// Collect data
$registrant_id = $_POST['userId'] ?? null;
$note = $_POST['note'] ?? '';
$status = $_POST['status'] ?? '';
$remarks = $_POST['remarks'] ?? '';
$date = date('Y-m-d');

// Validate required field
if (!$registrant_id || !$note || !$status) {
    http_response_code(400);
    echo json_encode(["error" => "Missing required fields"]);
    exit;
}

// Handle file uploads
$uploadedUrls = [];
if (!empty($_FILES['photos']['name'][0])) {
    $uploadDir = 'uploads/';
    if (!is_dir($uploadDir)) mkdir($uploadDir, 0777, true);

    foreach ($_FILES['photos']['tmp_name'] as $index => $tmpName) {
        $filename = basename($_FILES['photos']['name'][$index]);
        $targetPath = $uploadDir . time() . '_' . $filename;

        if (move_uploaded_file($tmpName, $targetPath)) {
            $uploadedUrls[] = $targetPath;
        }
    }
}

$photoUrlsJson = json_encode($uploadedUrls);

// Prepare and bind
$stmt = $conn->prepare("INSERT INTO quarterly_updates (registrant_id, update_date, notes, photo_urls, status, remarks) VALUES (?, ?, ?, ?, ?, ?)");

if (!$stmt) {
    http_response_code(500);
    echo json_encode(["error" => "Prepare failed: " . $conn->error]);
    exit;
}

$stmt->bind_param("isssss", $registrant_id, $date, $note, $photoUrlsJson, $status, $remarks);

if ($stmt->execute()) {
    echo json_encode(["success" => true, "message" => "Update saved successfully."]);
} else {
    http_response_code(500);
    echo json_encode(["error" => "Execute failed: " . $stmt->error]);
}

$stmt->close();
$conn->close();
?>
