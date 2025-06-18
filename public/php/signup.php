<?php
require_once 'configuration.php';

$message = '';

if ($_SERVER["REQUEST_METHOD"] == "POST") {
    $email = trim($_POST['email']);
    $password = $_POST['password'];
    $confirmPassword = $_POST['confirmPassword'];

    if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
        $message = "Invalid email format.";
    } elseif ($password !== $confirmPassword) {
        $message = "Passwords do not match.";
    } else {
        $hashedPassword = password_hash($password, PASSWORD_DEFAULT);

        $stmt = $conn->prepare("INSERT INTO users (email, password, user_type) VALUES (?, ?, 'partner')");
        $stmt->bind_param("ss", $email, $hashedPassword);

        if ($stmt->execute()) {
            $message = "Account created successfully.";
        } else {
            if ($conn->errno == 1062) {
                $message = "Email is already registered.";
            } else {
                $message = "Database error: " . $conn->error;
            }
        }

        $stmt->close();
        $conn->close();
    }
}
?>

<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Imperial+Script&display=swap" rel="stylesheet">
    <title>Partner Sign Up - Coffee Clover</title>
    <link rel="stylesheet" href="../stylesheet/style.css" />
</head>
<body>
    <div class="split-container">
        <div class="image-side">
            <img src="../assets/signup-coffee.avif" alt="Coffee beans and plants background" />
            <div class="image-overlay-title">Aniya</div>
            <p>You can choose your favorite coffee here.</p>
        </div>
        <div class="form-side">
            <div class="form-container">
                <h2>Create your account</h2>

                <?php if (!empty($message)) : ?>
                    <div class="form-message" style="color: red; margin-bottom: 10px;">
                        <?php echo $message; ?>
                    </div>
                <?php endif; ?>

                <form id="signupForm" method="POST" action="">
                    <label for="email">Email address</label>
                    <input type="email" id="email" name="email" placeholder="Enter your email" required />
                    
                    <label for="password">Password</label>
                    <input type="password" id="password" name="password" placeholder="Enter your password" required />
                    
                    <label for="confirmPassword">Confirm Password</label>
                    <input type="password" id="confirmPassword" name="confirmPassword" placeholder="Confirm your password" required />
                    
                    <button type="submit" class="btn-primary">Sign Up</button>
                </form>

                <p class="login-link">Already have an account? <a href="login.php">Log In</a></p>
                <p class="partnership-link" style="margin-top: 20px;">After signing up, please <a href="partnership_form.php">fill out the partnership form</a> to connect with us.</p>
            </div>
        </div>
    </div>
    <script src="script.js"></script>
</body>
</html>
