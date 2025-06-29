<?php
require_once 'configuration.php';

if ($_SERVER["REQUEST_METHOD"] == "POST") {
    $email = trim($_POST['email']);
    $password = $_POST['password'];
    $confirmPassword = $_POST['confirmPassword'];

    if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
        $error = "Invalid email format.";
    } elseif ($password !== $confirmPassword) {
        $error = "Passwords do not match.";
    } else {
        $hashedPassword = password_hash($password, PASSWORD_DEFAULT);

        $stmt = $conn->prepare("INSERT INTO users (email, password, user_type) VALUES (?, ?, 'partner')");
        $stmt->bind_param("ss", $email, $hashedPassword);

        if ($stmt->execute()) {
            header("Location: ../login.html?signup=success");
            exit;
        } else {
            if ($conn->errno == 1062) {
                $error = "Email is already registered.";
            } else {
                $error = "Database error: " . $conn->error;
            }
        }

        $stmt->close();
    }

    $conn->close();
}

// If there was an error, redirect back with error message as query param
if (isset($error)) {
    header("Location: ../signup.html?error=" . urlencode($error));
    exit;
}
?>

