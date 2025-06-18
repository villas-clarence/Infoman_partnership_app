<?php
if ($_SERVER["REQUEST_METHOD"] == "POST") {
    // Process form data
    $name = htmlspecialchars($_POST['name']);
    $email = htmlspecialchars($_POST['email']);
    $message = htmlspecialchars($_POST['message']);

    // For demonstration, save data to a file (partnership_submissions.txt)
    $data = "Name: $name\nEmail: $email\nMessage: $message\n---\n";
    file_put_contents('partnership_submissions.txt', $data, FILE_APPEND);

    $success = "Thank you for your partnership inquiry, $name. We will get back to you soon.";
}
?>

<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>Partnership Form - Coffee Clover</title>
    <link rel="stylesheet" href="style.css" />
</head>
<body style="background-color: #2f4f2f; color: #e6e6d4; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;">
    <div class="container" style="max-width: 600px; margin: 40px auto; background: linear-gradient(135deg, #2f4f2f 0%, #1f3f1f 100%); padding: 40px; border-radius: 20px; box-shadow: 0 20px 60px rgba(0, 0, 0, 0.5); border: 2px solid #a3c293;">
        <h2 style="color: #a3c293; font-weight: 700; font-size: 2.5rem; margin-bottom: 30px;">Partnership Inquiry</h2>
        <?php if (!empty($success)): ?>
            <p style="font-size: 1.2rem; margin-bottom: 20px; color: #a3c293;"><?= $success ?></p>
        <?php endif; ?>
        <form method="POST" action="">
            <label for="name" style="display: block; margin-bottom: 8px;">Name:</label>
            <input type="text" id="name" name="name" required style="width: 100%; padding: 10px; margin-bottom: 20px; border-radius: 8px; border: none;" />
            
            <label for="email" style="display: block; margin-bottom: 8px;">Email:</label>
            <input type="email" id="email" name="email" required style="width: 100%; padding: 10px; margin-bottom: 20px; border-radius: 8px; border: none;" />
            
            <label for="message" style="display: block; margin-bottom: 8px;">Message:</label>
            <textarea id="message" name="message" rows="5" required style="width: 100%; padding: 10px; margin-bottom: 20px; border-radius: 8px; border: none;"></textarea>
            
            <button type="submit" style="background-color: #a3c293; color: #2f4f2f; padding: 12px 20px; border: none; border-radius: 8px; font-weight: 700; cursor: pointer;">Submit</button>
        </form>
    </div>
</body>
</html>
