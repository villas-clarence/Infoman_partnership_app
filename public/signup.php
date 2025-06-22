<?php
// Database connection parameters
$servername = "localhost";
$username = "root";
$password = "";
$dbname = "coffee_clover_db";

// Create connection
$conn = new mysqli($servername, $username, $password, $dbname);

// Check connection
if ($conn->connect_error) {
    die("Connection failed: " . $conn->connect_error);
}

$errors = [];
$success = "";

if ($_SERVER["REQUEST_METHOD"] == "POST") {
    // Validate email and password
    if (empty($_POST['email']) || empty($_POST['password']) || empty($_POST['confirmPassword'])) {
        $errors[] = "All fields are required.";
    } else {
        $email = filter_var($_POST['email'], FILTER_SANITIZE_EMAIL);
        $password = $_POST['password'];
        $confirmPassword = $_POST['confirmPassword'];

        if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
            $errors[] = "Invalid email format.";
        }

        if ($password !== $confirmPassword) {
            $errors[] = "Passwords do not match.";
        }

        if (strlen($password) < 6) {
            $errors[] = "Password must be at least 6 characters.";
        }
    }

    if (empty($errors)) {
        // Check if user already exists
        $stmt = $conn->prepare("SELECT id FROM users WHERE email = ?");
        $stmt->bind_param("s", $email);
        $stmt->execute();
        $stmt->store_result();

        if ($stmt->num_rows > 0) {
            $errors[] = "User with this email already exists.";
        } else {
            // Insert new user with hashed password
            $passwordHash = password_hash($password, PASSWORD_DEFAULT);
            $insertStmt = $conn->prepare("INSERT INTO users (email, password_hash) VALUES (?, ?)");
            $insertStmt->bind_param("ss", $email, $passwordHash);

            if ($insertStmt->execute()) {
                $success = "User registered successfully. You can now <a href='login.html'>login</a>.";
            } else {
                $errors[] = "Error registering user: " . $conn->error;
            }
            $insertStmt->close();
        }
        $stmt->close();
    }
}

$conn->close();
?>

<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>Sign Up - Coffee Clover</title>
    <link rel="stylesheet" href="style.css" />
</head>
<body>
    <div class="form-container">
        <h2>Create your account</h2>
        <?php
        if (!empty($errors)) {
            echo '<div class="error-messages"><ul>';
            foreach ($errors as $error) {
                echo "<li>" . htmlspecialchars($error) . "</li>";
            }
            echo '</ul></div>';
        }
        if ($success) {
            echo '<div class="success-message">' . $success . '</div>';
        }
        ?>
        <form method="POST" action="signup.php">
            <label for="email">Email address</label>
            <input type="email" id="email" name="email" placeholder="Enter your email" required />
            
            <label for="password">Password</label>
            <input type="password" id="password" name="password" placeholder="Enter your password" required />
            
            <label for="confirmPassword">Confirm Password</label>
            <input type="password" id="confirmPassword" name="confirmPassword" placeholder="Confirm your password" required />
            
            <button type="submit" class="btn-primary">Sign Up</button>
        </form>
        <p class="login-link">Already have an account? <a href="login.php">Log In</a></p>
    </div>
</body>
</html>
