<?php
session_start();
require_once 'configuration.php'; // assumes $conn is your DB connection

if ($_SERVER["REQUEST_METHOD"] == "POST") {
    $email = trim($_POST['email']);
    $password = $_POST['password'];
    $userType = $_POST['userType'];

    $stmt = $conn->prepare("SELECT id, email, password, user_type FROM users WHERE email = ?");
    $stmt->bind_param("s", $email);
    $stmt->execute();
    $result = $stmt->get_result();

    if ($result->num_rows === 1) {
        $user = $result->fetch_assoc();

        if ($user['user_type'] === $userType && password_verify($password, $user['password'])) {
            $_SESSION['user_id'] = $user['id'];
            $_SESSION['user_type'] = $user['user_type'];

            if ($user['user_type'] === 'admin') {
                header("Location: ../admin_dashboard.html");
            } else {
                header("Location: ../aniya_registration_form.html");
            }
            exit;
        } else {
            $error = "Invalid password or user type.";
        }
    } else {
        $error = "No user found with that email.";
    }

    $stmt->close();
    $conn->close();

    header("Location: ../login.html?error=" . urlencode($error));
    exit;
}
?>
