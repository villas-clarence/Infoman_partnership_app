<?php
// Database connection setup
$host = "localhost";
$user = "root";
$password = ""; // Set your MySQL password if needed
$database = "tree_name";

// Connect to MySQL
$conn = new mysqli($host, $user, $password, $database);

// Check for errors
if ($conn->connect_error) {
    http_response_code(500);
    echo json_encode(["error" => "Connection failed: " . $conn->connect_error]);
    exit();
}

// Set content type for JSON response by default
header('Content-Type: application/json');

// Handle GET request - Read all partnerships
if ($_SERVER['REQUEST_METHOD'] === 'GET') {
    $result = $conn->query("SELECT * FROM partnerships ORDER BY id DESC");
    $partnerships = [];
    while ($row = $result->fetch_assoc()) {
        $partnerships[] = $row;
    }
    echo json_encode($partnerships);
    $conn->close();
    exit();
}

// Handle POST request - Create, Update, Delete based on 'action'
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $action = $_POST['action'] ?? 'create'; // Default to create if no action provided

    if ($action === 'create') {
        $user_name = trim($_POST['user_name'] ?? '');
        if (empty($user_name)) {
            http_response_code(400);
            echo json_encode(["error" => "Please enter a valid name."]);
            exit();
        }
        $stmt = $conn->prepare("INSERT INTO partnerships (user_name) VALUES (?)");
        $stmt->bind_param("s", $user_name);
        if ($stmt->execute()) {
            echo json_encode(["success" => "Partnership created successfully.", "id" => $stmt->insert_id]);
        } else {
            http_response_code(500);
            echo json_encode(["error" => $stmt->error]);
        }
        $stmt->close();
        $conn->close();
        exit();
    }

    if ($action === 'update') {
        $id = intval($_POST['id'] ?? 0);
        $user_name = trim($_POST['user_name'] ?? '');
        if ($id <= 0 || empty($user_name)) {
            http_response_code(400);
            echo json_encode(["error" => "Invalid ID or name."]);
            exit();
        }
        $stmt = $conn->prepare("UPDATE partnerships SET user_name = ? WHERE id = ?");
        $stmt->bind_param("si", $user_name, $id);
        if ($stmt->execute()) {
            echo json_encode(["success" => "Partnership updated successfully."]);
        } else {
            http_response_code(500);
            echo json_encode(["error" => $stmt->error]);
        }
        $stmt->close();
        $conn->close();
        exit();
    }

    if ($action === 'delete') {
        $id = intval($_POST['id'] ?? 0);
        if ($id <= 0) {
            http_response_code(400);
            echo json_encode(["error" => "Invalid ID."]);
            exit();
        }
        $stmt = $conn->prepare("DELETE FROM partnerships WHERE id = ?");
        $stmt->bind_param("i", $id);
        if ($stmt->execute()) {
            echo json_encode(["success" => "Partnership deleted successfully."]);
        } else {
            http_response_code(500);
            echo json_encode(["error" => $stmt->error]);
        }
        $stmt->close();
        $conn->close();
        exit();
    }

    // Unknown action
    http_response_code(400);
    echo json_encode(["error" => "Unknown action."]);
    $conn->close();
    exit();
}

// If request method is not GET or POST
http_response_code(405);
echo json_encode(["error" => "Method not allowed."]);
$conn->close();
exit();
?>


