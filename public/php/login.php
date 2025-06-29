<?php
session_start();
require_once 'configuration.php'; // Your DB connection (mysqli $conn)

if ($_SERVER["REQUEST_METHOD"] == "POST") {
    $email = trim($_POST['email']);
    $password = $_POST['password'];
    $userType = $_POST['userType'];

    $stmt = $conn->prepare("SELECT id, email, password, user_type FROM users WHERE email = ? AND user_type = ?");
    $stmt->bind_param("ss", $email, $userType);
    $stmt->execute();
    $result = $stmt->get_result();

    if ($result->num_rows === 1) {
        $user = $result->fetch_assoc();

        if (password_verify($password, $user['password'])) {
            $_SESSION['user_id'] = $user['id'];
            $_SESSION['user_type'] = $user['user_type'];

            // REDIRECTS BASED ON ROLE
            if ($user['user_type'] === 'admin') {
                header("Location: ../admin_dashboard.php");
            } else {
                header("Location: ../aniya_registration_form.html"); // for partner
            }
            exit;
        } else {
            $error = "Invalid password.";
        }
    } else {
        $error = "No user found with that email and role.";
    }

    $stmt->close();
    $conn->close();

    // Redirect with error
    header("Location: ../login.html?error=" . urlencode($error));
    exit;
}
?>
