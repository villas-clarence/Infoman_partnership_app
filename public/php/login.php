<?php
session_start();
require_once 'configuration.php';

if ($_SERVER["REQUEST_METHOD"] == "POST") {
    $email = trim($_POST['email']);
    $password = $_POST['password'];
    $userType = $_POST['userType'];

    if ($userType === 'admin') {
        // Admin login
        $stmt = $conn->prepare("SELECT admin_id, username, password_hash, role FROM admin_users WHERE username = ?");
        $stmt->bind_param("s", $email);
        $stmt->execute();
        $result = $stmt->get_result();

        if ($result->num_rows === 1) {
            $admin = $result->fetch_assoc();

            if (password_verify($password, $admin['password_hash'])) {
                $_SESSION['admin_id'] = $admin['admin_id'];
                $_SESSION['user_type'] = 'admin';
                $_SESSION['role'] = $admin['role'];

                header("Location: ../admin_dashboard.html");
                exit;
            } else {
                $error = "Incorrect password for admin.";
            }
        } else {
            $error = "Admin not found.";
        }

        $stmt->close();
    } else {
        // Regular user login
        $stmt = $conn->prepare("SELECT id, email, password, user_type FROM users WHERE email = ?");
        $stmt->bind_param("s", $email);
        $stmt->execute();
        $result = $stmt->get_result();

        if ($result->num_rows === 1) {
            $user = $result->fetch_assoc();

            if ($user['user_type'] === $userType && password_verify($password, $user['password'])) {
                $_SESSION['user_id'] = $user['id'];
                $_SESSION['user_type'] = $user['user_type'];

                // 🎯 Fetch the corresponding registrant_id
                $reg_stmt = $conn->prepare("SELECT registrant_id FROM registrants WHERE user_id = ?");
                $reg_stmt->bind_param("i", $user['id']);
                $reg_stmt->execute();
                $reg_result = $reg_stmt->get_result();

                if ($reg_result->num_rows === 1) {
                    $registrant = $reg_result->fetch_assoc();
                    $_SESSION['registrant_id'] = $registrant['registrant_id'];
                }

                $reg_stmt->close();

                header("Location: ../aniya_registration_form.html");
                exit;
            } else {
                $error = "Incorrect password or mismatched user type.";
            }
        } else {
            $error = "User not found.";
        }

        $stmt->close();
    }

    $conn->close();

    // Redirect with error
    header("Location: ../login.html?error=" . urlencode($error));
    exit;
}
?>
