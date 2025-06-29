<?php
$host = "localhost";
$user = "root";
$password = ""; // Set your password if needed
$database = "aniya_database";

// Connect to MySQL
$conn = new mysqli($host, $user, $password, $database);

// Check connection
if ($conn->connect_error) {
    http_response_code(500);
    echo json_encode(["error" => "Connection failed: " . $conn->connect_error]);
    exit();
}

header('Content-Type: application/json');

// GET: Fetch all records
if ($_SERVER['REQUEST_METHOD'] === 'GET') {
    $sql = "SELECT * FROM partnerships ORDER BY id DESC";
    $result = $conn->query($sql);

    if (!$result) {
        http_response_code(500);
        echo json_encode(["error" => "SQL Error: " . $conn->error]);
        exit();
    }

    $records = [];
    while ($row = $result->fetch_assoc()) {
        $records[] = $row;
    }

    echo json_encode($records);
    $conn->close();
    exit();
}

// POST: Create, Update, Delete
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $action = $_POST['action'] ?? '';

    // CREATE
    if ($action === 'create') {
        $user_name = trim($_POST['user_name'] ?? '');
        if (empty($user_name)) {
            http_response_code(400);
            echo json_encode(["error" => "Name is required."]);
            exit();
        }

        $stmt = $conn->prepare("INSERT INTO partnerships (user_name) VALUES (?)");
        $stmt->bind_param("s", $user_name);

        if ($stmt->execute()) {
            echo json_encode(["success" => "Partnership added.", "id" => $stmt->insert_id]);
        } else {
            http_response_code(500);
            echo json_encode(["error" => $stmt->error]);
        }

        $stmt->close();
        $conn->close();
        exit();
    }

    // UPDATE
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
            echo json_encode(["success" => "Partnership updated."]);
        } else {
            http_response_code(500);
            echo json_encode(["error" => $stmt->error]);
        }

        $stmt->close();
        $conn->close();
        exit();
    }

    // DELETE
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
            echo json_encode(["success" => "Partnership deleted."]);
        } else {
            http_response_code(500);
            echo json_encode(["error" => $stmt->error]);
        }

        $stmt->close();
        $conn->close();
        exit();
    }

    // Unknown Action
    http_response_code(400);
    echo json_encode(["error" => "Unknown action."]);
    $conn->close();
    exit();
}

http_response_code(405);
echo json_encode(["error" => "Method not allowed."]);
$conn->close();
exit();
?>