<?php
// DB connection
$host = "localhost";
$user = "root";
$password = ""; // Your MySQL password if any
$database = "tree_name";

$conn = new mysqli($host, $user, $password, $database);

// Connection check
if ($conn->connect_error) {
    die("❌ Connection failed: " . $conn->connect_error);
}

// Handle deletion
if (isset($_GET['delete'])) {
    $id = intval($_GET['delete']);
    $conn->query("DELETE FROM partnerships WHERE id = $id");
    header("Location: manage.php");
    exit;
}

// Get all partnerships
$result = $conn->query("SELECT * FROM partnerships ORDER BY id DESC");
?>

<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <title>Manage Partnerships</title>
    <link rel="stylesheet" href="css/style.css" />
    <style>
        body {
            font-family: 'Segoe UI', sans-serif;
            background: #f8f8f8;
            padding: 20px;
        }
        table {
            width: 100%;
            background: white;
            border-collapse: collapse;
            margin-top: 20px;
        }
        th, td {
            border: 1px solid #ccc;
            padding: 10px 15px;
            text-align: left;
        }
        th {
            background: #4CAF50;
            color: white;
        }
        .delete-btn {
            background: #e74c3c;
            color: white;
            padding: 5px 10px;
            text-decoration: none;
            border-radius: 4px;
        }
        .back-btn {
            display: inline-block;
            margin-bottom: 15px;
            background: #3498db;
            color: white;
            padding: 8px 12px;
            border-radius: 4px;
            text-decoration: none;
        }
    </style>
</head>
<body>

    <a href="partnership_smallscale.html" class="back-btn">← Back to Partnership Page</a>

    <h2>🌿 Partnership Records</h2>

    <?php if ($result->num_rows > 0): ?>
        <table>
            <tr>
                <th>ID</th>
                <th>User Name</th>
                <th>Submitted At</th>
                <th>Action</th>
            </tr>
            <?php while($row = $result->fetch_assoc()): ?>
                <tr>
                    <td><?= htmlspecialchars($row['id']) ?></td>
                    <td><?= htmlspecialchars($row['user_name']) ?></td>
                    <td><?= htmlspecialchars($row['created_at']) ?></td>
                    <td><a href="?delete=<?= $row['id'] ?>" class="delete-btn" onclick="return confirm('Are you sure you want to delete this entry?')">Delete</a></td>
                </tr>
            <?php endwhile; ?>
        </table>
    <?php else: ?>
        <p>No partnership records found.</p>
    <?php endif; ?>

    <?php $conn->close(); ?>

</body>
</html>