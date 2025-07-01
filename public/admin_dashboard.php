<?php
header('Content-Type: application/json');
$host = "localhost";
$user = "root";
$password = "";
$db = "aniya_database";

$conn = new mysqli($host, $user, $password, $db);
if ($conn->connect_error) {
    echo json_encode(['error' => 'DB connection failed']);
    exit();
}

$sql = "
SELECT 
    r.registrant_id,
    r.full_name,
    r.email,
    r.mobile,
    r.company_name,
    r.role,
    p.package_type,
    rp.tree_count
FROM registrants r
LEFT JOIN registrant_packages rp ON r.registrant_id = rp.registrant_id
LEFT JOIN packages p ON rp.package_id = p.package_id
ORDER BY r.created_at DESC
";

$result = $conn->query($sql);
$data = [];

while ($row = $result->fetch_assoc()) {
    $data[] = $row;
}

echo json_encode($data);
$conn->close();
