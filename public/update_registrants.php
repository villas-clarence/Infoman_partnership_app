<?php
$host = "localhost";
$user = "root";
$password = "";
$db = "aniya_database";

$conn = new mysqli($host, $user, $password, $db);
if ($conn->connect_error) {
    echo json_encode(['success' => false, 'error' => 'DB connection failed']);
    exit();
}

$registrant_id = $_POST['registrant_id'];
$full_name = $_POST['full_name'];
$email = $_POST['email'];
$mobile = $_POST['mobile'];
$company = $_POST['company_name'];
$role = $_POST['role'];
$tree_count = isset($_POST['tree_count']) ? intval($_POST['tree_count']) : 0;
$package_type = $_POST['package_type'] ?? '';

$conn->begin_transaction();

$stmt = $conn->prepare("UPDATE registrants SET full_name=?, email=?, mobile=?, company_name=?, role=? WHERE registrant_id=?");
$stmt->bind_param("sssssi", $full_name, $email, $mobile, $company, $role, $registrant_id);

$success = $stmt->execute();
$stmt->close();

if ($success) {
    // Check if registrant_packages entry exists
    $checkStmt = $conn->prepare("SELECT COUNT(*) FROM registrant_packages WHERE registrant_id = ?");
    $checkStmt->bind_param("i", $registrant_id);
    $checkStmt->execute();
    $checkStmt->bind_result($count);
    $checkStmt->fetch();
    $checkStmt->close();

    if ($count > 0) {
        // Update existing entry with both tree_count and package_id
        $pkgIdStmt = $conn->prepare("SELECT package_id FROM packages WHERE package_type = ?");
        $pkgIdStmt->bind_param("s", $package_type);
        $pkgIdStmt->execute();
        $pkgIdStmt->bind_result($new_package_id);
        $pkgIdStmt->fetch();
        $pkgIdStmt->close();

        $updateStmt = $conn->prepare("UPDATE registrant_packages SET tree_count = ?, package_id = ? WHERE registrant_id = ?");
        $updateStmt->bind_param("iii", $tree_count, $new_package_id, $registrant_id);
        $success = $updateStmt->execute();
        $updateStmt->close();
    } else {
        // Fetch package_id for registrant or default
        $pkgStmt = $conn->prepare("SELECT package_id FROM registrant_packages WHERE registrant_id = ? LIMIT 1");
        $pkgStmt->bind_param("i", $registrant_id);
        $pkgStmt->execute();
        $pkgStmt->bind_result($package_id);
        $pkgStmt->fetch();
        $pkgStmt->close();

        if (!$package_id) {
            $defaultPkgStmt = $conn->prepare("SELECT package_id FROM packages LIMIT 1");
            $defaultPkgStmt->execute();
            $defaultPkgStmt->bind_result($package_id);
            $defaultPkgStmt->fetch();
            $defaultPkgStmt->close();
        }

        // Insert new entry with package_id
        $insertStmt = $conn->prepare("INSERT INTO registrant_packages (registrant_id, package_id, tree_count) VALUES (?, ?, ?)");
        $insertStmt->bind_param("iii", $registrant_id, $package_id, $tree_count);
        $success = $insertStmt->execute();
        $insertStmt->close();
    }
}

if ($success) {
    $conn->commit();
    echo json_encode(['success' => true]);
} else {
    $conn->rollback();
    echo json_encode(['success' => false, 'error' => $conn->error]);
}

$conn->close();
