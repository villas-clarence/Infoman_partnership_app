// ✅ Final: edit_registration.php
<?php
if (isset($_GET['id'])) {
    $id = intval($_GET['id']);
    $conn = new mysqli("localhost", "root", "", "aniya_database");
    if ($conn->connect_error) {
        echo json_encode(["success" => false, "message" => "Connection failed."]);
        exit();
    }

    $result = $conn->query("SELECT * FROM registrants WHERE registrant_id = $id");
    if ($result && $result->num_rows > 0) {
        $data = $result->fetch_assoc();
        echo json_encode(["success" => true, "data" => $data]);
    } else {
        echo json_encode(["success" => false, "message" => "Registrant not found."]);
    }
    $conn->close();
} else {
    echo json_encode(["success" => false, "message" => "Invalid ID."]);
}