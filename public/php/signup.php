<?php
require_once 'configuration.php';

if ($_SERVER["REQUEST_METHOD"] == "POST") {
    $email = trim($_POST['email']);
    $password = $_POST['password'];
    $confirmPassword = $_POST['confirmPassword'];
    $userType = isset($_POST['userType']) ? $_POST['userType'] : 'partner';

    if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
        $error = "Invalid email format.";
    } elseif ($password !== $confirmPassword) {
        $error = "Passwords do not match.";
    } else {
        $hashedPassword = password_hash($password, PASSWORD_DEFAULT);

        if ($userType === 'admin') {
            // Admin registration
            $check = $conn->prepare("SELECT 1 FROM admin_users WHERE username = ?");
            $check->bind_param("s", $email);
            $check->execute();
            $check->store_result();

            if ($check->num_rows > 0) {
                $error = "Admin email is already registered.";
            } else {
                $stmt = $conn->prepare("INSERT INTO admin_users (username, password_hash, role) VALUES (?, ?, 'Admin')");
                $stmt->bind_param("ss", $email, $hashedPassword);

                if ($stmt->execute()) {
                    header("Location: ../login.html?signup=admin_success");
                    exit;
                } else {
                    $error = "Admin registration error: " . $conn->error;
                }
                $stmt->close();
            }
            $check->close();

        } else {
            // Regular user registration
            $stmt = $conn->prepare("INSERT INTO users (email, password, user_type) VALUES (?, ?, ?)");
            $stmt->bind_param("sss", $email, $hashedPassword, $userType);

            if ($stmt->execute()) {
                $user_id = $stmt->insert_id;

                // Insert into registrants with only essential/default info
                $default_name = "Unnamed Partner";
                $default_mobile = "0000000000";

                $regStmt = $conn->prepare("
                    INSERT INTO registrants (
                        full_name, email, mobile, certificate_name, dashboard_pref,
                        gift_pref, notification_pref, zoom_call, agreement, user_id
                    ) VALUES (?, ?, ?, '', '', '', '', '', 0, ?)
                ");
                $regStmt->bind_param("sssi", $default_name, $email, $default_mobile, $user_id);

                if ($regStmt->execute()) {
                    header("Location: ../login.html?signup=success");
                    exit;
                } else {
                    $error = "Registrant creation failed: " . $conn->error;
                }

                $regStmt->close();
            } else {
                if ($conn->errno == 1062) {
                    $error = "Email already exists.";
                } else {
                    $error = "User registration failed: " . $conn->error;
                }
            }

            $stmt->close();
        }
    }

    $conn->close();

    // Redirect with error if any
    if (isset($error)) {
        header("Location: ../signup.html?error=" . urlencode($error));
        exit;
    }
}
?>
