<?php

header('Content-Type: application/json');

$host = "localhost";        
$user = "root";             
$password = "";             
$db = "aniya_database2";    

// Connect to the database
$conn = new mysqli($host, $user, $password, $db);

// Check connection
if ($conn->connect_error) {
    http_response_code(500);
    echo json_encode(["error" => "Database connection failed: " . $conn->connect_error]);
    exit();
}

// Handle POST request
if ($_SERVER["REQUEST_METHOD"] == "POST") {
    // Get input and sanitize
    $name = $conn->real_escape_string($_POST["name"]);
    $email = $conn->real_escape_string($_POST["email"]);
    $message = $conn->real_escape_string($_POST["message"]);

    // Basic validation
    if (empty($name) || empty($email) || empty($message)) {
        http_response_code(400);
        echo json_encode(["error" => "All fields are required."]);
        exit();
    }

    // Insert query
    $sql = "INSERT INTO contact (name, email, message) VALUES ('$name', '$email', '$message')";

    if ($conn->query($sql) === TRUE) {
        echo json_encode(["success" => "Message sent successfully!"]);
    } else {
        http_response_code(500);
        echo json_encode(["error" => "Failed to send message: " . $conn->error]);
    }
}

$conn->close();
?>
