<?php
$host = "localhost";
$username = "root";
$password = "";
$database = "aniya_database";

$conn = new mysqli($host, $username, $password, $database);

if ($conn->connect_error) {
    die("MYSQL CONNECTION FAILED" . $conn->connect_error); 
} 

return $conn;
?>