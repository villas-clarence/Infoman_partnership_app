<?php
header('Content-Type: application/json');
$host = "localhost";
$user = "root";
$password = "";
$db = "aniya_database";

$conn = new mysqli($host, $user, $password, $db);
if ($conn->connect_error) {
    http_response_code(500);
    echo json_encode(["error" => "DB Connection Failed"]);
    exit();
}

$sql = "
SELECT 
    r.registrant_id,
    r.full_name,
    r.email,
    r.mobile,
    p.package_type,
    rp.tree_count
FROM registrants r
LEFT JOIN registrant_packages rp ON r.registrant_id = rp.registrant_id
LEFT JOIN packages p ON rp.package_id = p.package_id
ORDER BY r.created_at DESC
";

$result = $conn->query($sql);
$rows = [];

if ($result) {
    while ($row = $result->fetch_assoc()) {
        $rows[] = $row;
    }
}

echo json_encode($rows);
$conn->close();
