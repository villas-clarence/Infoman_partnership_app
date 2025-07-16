<?php
// fetch_users_admin.php

$host = 'localhost'; // or your database host
$db   = 'aniya_database';
$user = 'root'; // your db username
$pass = ''; // your db password
$charset = 'utf8mb4';

$dsn = "mysql:host=$host;dbname=$db;charset=$charset";
$options = [
    PDO::ATTR_ERRMODE            => PDO::ERRMODE_EXCEPTION,
    PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
    PDO::ATTR_EMULATE_PREPARES   => false,
];

try {
     $pdo = new PDO($dsn, $user, $pass, $options);
} catch (\PDOException $e) {
     http_response_code(500);
     echo json_encode(["error" => "Database connection failed"]);
     exit;
}

header('Content-Type: application/json');

$stmt = $pdo->query("SELECT registrant_id, full_name FROM registrants ORDER BY full_name ASC");
$users = $stmt->fetchAll();

echo json_encode($users);
?>
