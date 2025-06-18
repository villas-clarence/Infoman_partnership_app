<?php
session_start();
require_once 'configuration.php';

$message = '';

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

            if ($user['user_type'] === 'admin') {
                header("Location: admin_dashboard.php");
            } else {
                header("Location: partner_dashboard.php");
            }
            exit;
        } else {
            $message = "Invalid password.";
        }
    } else {
        $message = "No user found with that email and role.";
    }

    $stmt->close();
    $conn->close();
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
    <title>Partner Login - Coffee Clover</title>
    <link rel="stylesheet" href="../stylesheet/style.css" />
</head>
<body>
    <div class="split-container">
        <div class="image-side login-image">
            <img src="../assets/signup-coffee.jpg" alt="Coffee beans and plants background" />
            <div class="image-overlay-title">Aniya</div>
            <p>You can choose your favorite coffee here.</p>    
        </div>
        <div class="form-side">
            <div class="form-container">
                <h2>Welcome Back, Please login to your Account</h2>

                <?php if (!empty($message)): ?>
                    <div class="form-message" style="color:red; margin-bottom:10px;">
                        <?php echo $message; ?>
                    </div>
                <?php endif; ?>

                <form id="loginForm" method="POST" action="login.php">
                    <label for="email">Email address</label>
                    <input type="email" id="email" name="email" placeholder="Enter your email" required />
                    
                    <label for="password">Password</label>
                    <input type="password" id="password" name="password" placeholder="Enter your password" required />
                    
                    <label>User Type</label>
                    <div class="user-type">
                        <label><input type="radio" name="userType" value="partner" checked /> Partner</label>
                        <label><input type="radio" name="userType" value="admin" /> Admin</label>
                    </div>
                    
                    <div class="form-extra">
                        <label><input type="checkbox" name="remember" /> Remember me</label>
                        <a href="#" class="forgot-password">Forgot password?</a>
                    </div>
                    
                    <button type="submit" class="btn-primary">Sign In</button>
                </form>

                <div class="alternative-signin">
                    <span>Or</span>
                    <button class="btn-google">Sign in with Google</button>
                </div>

                <p class="signup-link">Don't have an account? <a href="signup.php">Sign up</a></p>
            </div>
        </div>
    </div>

    <script src="script.js"></script>
</body>
</html>
