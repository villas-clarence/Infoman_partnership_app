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
    if (empty($_POST['email']) || empty($_POST['password'])) {
        $errors[] = "Email and password are required.";
    } else {
        $email = filter_var($_POST['email'], FILTER_SANITIZE_EMAIL);
        $password = $_POST['password'];

        if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
            $errors[] = "Invalid email format.";
        }
    }

    if (empty($errors)) {
        // Check if user exists
        $stmt = $conn->prepare("SELECT id, password_hash FROM users WHERE email = ?");
        $stmt->bind_param("s", $email);
        $stmt->execute();
        $stmt->store_result();

        if ($stmt->num_rows == 1) {
            $stmt->bind_result($id, $passwordHash);
            $stmt->fetch();

            if (password_verify($password, $passwordHash)) {
                $success = "Login successful. Welcome back!";
                // You can start a session here and set session variables if needed
            } else {
                $errors[] = "Incorrect password.";
            }
        } else {
            $errors[] = "User not found.";
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
    <title>Login - Coffee Clover</title>
    <link rel="stylesheet" href="style.css" />
</head>
<body>
    <div class="form-container">
        <h2>Login to your account</h2>
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
        <form method="POST" action="login.php">
            <label for="email">Email address</label>
            <input type="email" id="email" name="email" placeholder="Enter your email" required />
            
            <label for="password">Password</label>
            <input type="password" id="password" name="password" placeholder="Enter your password" required />
            
            <button type="submit" class="btn-primary">Log In</button>
        </form>
        <p class="signup-link">Don't have an account? <a href="signup.php">Sign up</a></p>
    </div>
</body>
</html>
