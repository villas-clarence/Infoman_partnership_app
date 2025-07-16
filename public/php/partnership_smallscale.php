<?php
$host = "localhost";
$user = "root";
$password = "";
$database = "aniya_database";

$conn = new mysqli($host, $user, $password, $database);
mysqli_report(MYSQLI_REPORT_ERROR | MYSQLI_REPORT_STRICT); // Enable error reporting

if ($conn->connect_error) {
    http_response_code(500);
    echo json_encode(["error" => "Connection failed: " . $conn->connect_error]);
    exit();
}

header('Content-Type: application/json');

// First, let's create the tree_name_tag table if it doesn't exist
$createTableQuery = "
    CREATE TABLE IF NOT EXISTS tree_name_tag (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        registrant_id INT NOT NULL,
        deleted TINYINT(1) DEFAULT 0,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (registrant_id) REFERENCES registrants(registrant_id) ON DELETE CASCADE
    )
";

$conn->query($createTableQuery);

function generateCustomId($conn, $treeCount) {
    // Support both old and new package types for backward compatibility
    $newPackageType = ($treeCount >= 200) ? 'LG' : 'GW';
    $oldPackageType = ($treeCount >= 200) ? 'Legacy' : 'Grower';

    // Try to get last_number for new package type first
    $stmt = $conn->prepare("SELECT last_number FROM user_id_counters WHERE id_type = ?");
    $stmt->bind_param("s", $newPackageType);
    $stmt->execute();
    $stmt->store_result();

    $lastNumber = 0;
    if ($stmt->num_rows > 0) {
        $stmt->bind_result($lastNumber);
        $stmt->fetch();
        $stmt->close();

        $nextNumber = $lastNumber + 1;
        $updateStmt = $conn->prepare("UPDATE user_id_counters SET last_number = ? WHERE id_type = ?");
        $updateStmt->bind_param("is", $nextNumber, $newPackageType);
        $updateStmt->execute();
        $updateStmt->close();
    } else {
        $stmt->close();
        // If no entry for new package type, check old package type
        $stmtOld = $conn->prepare("SELECT last_number FROM user_id_counters WHERE id_type = ?");
        $stmtOld->bind_param("s", $oldPackageType);
        $stmtOld->execute();
        $stmtOld->store_result();

        if ($stmtOld->num_rows > 0) {
            $stmtOld->bind_result($lastNumber);
            $stmtOld->fetch();
            $stmtOld->close();

            $nextNumber = $lastNumber + 1;
            $updateStmtOld = $conn->prepare("UPDATE user_id_counters SET last_number = ? WHERE id_type = ?");
            $updateStmtOld->bind_param("is", $nextNumber, $oldPackageType);
            $updateStmtOld->execute();
            $updateStmtOld->close();
        } else {
            $stmtOld->close();
            $nextNumber = 1;
            // Insert new package type entry
            $insertStmt = $conn->prepare("INSERT INTO user_id_counters (id_type, last_number) VALUES (?, ?)");
            $insertStmt->bind_param("si", $newPackageType, $nextNumber);
            $insertStmt->execute();
            $insertStmt->close();
        }
    }

    $prefix = 'ANIYA-' . $newPackageType;
    return $prefix . '-' . str_pad($nextNumber, 3, '0', STR_PAD_LEFT);
}

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $action = $_POST['action'] ?? '';

    if ($action === 'register') {
        $full_name = trim($_POST['full_name'] ?? '');
        $email = trim($_POST['email'] ?? '');
        $mobile = trim($_POST['mobile'] ?? '');
        $company_name = trim($_POST['company_name'] ?? '');
        $role = trim($_POST['role'] ?? '');
        $contact_method = trim($_POST['contact_method'] ?? '');
        $certificate_name = trim($_POST['certificate_name'] ?? '');
        $dashboard_pref = trim($_POST['dashboard_pref'] ?? '');
        $gift_pref = trim($_POST['gift_pref'] ?? '');
        $notification_pref = $_POST['notification_pref'] ?? [];
        $zoom_call = trim($_POST['zoom_call'] ?? '');
        $agreement = isset($_POST['agreement']) && ($_POST['agreement'] === 'on' || $_POST['agreement'] === '1') ? 1 : 0;
        $tree_count = intval($_POST['tree_count'] ?? 0);

        // New livestock quantities and prices
        $livestock_quantities = $_POST['livestock_quantities'] ?? [];
        $livestock_prices = $_POST['livestock_prices'] ?? [];

        if (is_array($notification_pref)) {
            $notification_pref = implode(',', $notification_pref);
        } else {
            $notification_pref = trim($notification_pref);
        }

        if (empty($full_name) || empty($email) || empty($mobile)) {
            http_response_code(400);
            echo json_encode(["error" => "Missing required fields."]);
            $conn->close();
            exit();
        }

        $customId = generateCustomId($conn, $tree_count);

        $stmt = $conn->prepare("INSERT INTO registrants 
            (custom_id, full_name, email, mobile, company_name, role, contact_method, certificate_name, dashboard_pref, gift_pref, notification_pref, zoom_call, agreement, created_at) 
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW())");

        $stmt->bind_param("sssssssssssii", 
            $customId, $full_name, $email, $mobile, $company_name, $role, 
            $contact_method, $certificate_name, $dashboard_pref, $gift_pref, 
            $notification_pref, $zoom_call, $agreement
        );

        if ($stmt->execute()) {
            $registrantId = $stmt->insert_id;
            
            // If tree_count is provided, you might want to store it in the registrant_packages table
            if ($tree_count > 0) {
                // First, get or create the appropriate package
                $packageType = ($tree_count >= 200) ? 'Legacy' : 'Grower';
                
                $packageStmt = $conn->prepare("SELECT package_id FROM packages WHERE package_type = ?");
                $packageStmt->bind_param("s", $packageType);
                $packageStmt->execute();
                $packageResult = $packageStmt->get_result();
                
                if ($packageResult->num_rows > 0) {
                    $packageRow = $packageResult->fetch_assoc();
                    $packageId = $packageRow['package_id'];
                } else {
                    // Create new package type
                    $insertPackageStmt = $conn->prepare("INSERT INTO packages (package_type) VALUES (?)");
                    $insertPackageStmt->bind_param("s", $packageType);
                    $insertPackageStmt->execute();
                    $packageId = $insertPackageStmt->insert_id;
                    $insertPackageStmt->close();
                }
                $packageStmt->close();
                
                // Insert into registrant_packages
                $regPackageStmt = $conn->prepare("INSERT INTO registrant_packages (registrant_id, package_id, tree_count) VALUES (?, ?, ?)");
                $regPackageStmt->bind_param("iii", $registrantId, $packageId, $tree_count);
                $regPackageStmt->execute();
                $regPackageStmt->close();
            }
            
            echo json_encode(["success" => "Registration successful.", "custom_id" => $customId, "registrant_id" => $registrantId]);
        } else {
            http_response_code(500);
            echo json_encode(["error" => $stmt->error]);
        }

        $stmt->close();
        $conn->close();
        exit();
    }

    // ADD TREE NAME
    elseif ($action === 'addTreeName') {
        $treeName = trim($_POST['treeName'] ?? '');
        $registrantId = intval($_POST['registrantId'] ?? 0);

        error_log("addTreeName called with treeName: $treeName, registrantId: $registrantId");

        if (empty($treeName) || $registrantId <= 0) {
            http_response_code(400);
            echo json_encode(["error" => "Tree name and registrant ID are required."]);
            $conn->close();
            exit();
        }

        // Verify that the registrant exists
        $verifyStmt = $conn->prepare("SELECT registrant_id FROM registrants WHERE registrant_id = ?");
        $verifyStmt->bind_param("i", $registrantId);
        $verifyStmt->execute();
        $verifyResult = $verifyStmt->get_result();
        
        if ($verifyResult->num_rows === 0) {
            http_response_code(400);
            echo json_encode(["error" => "Invalid registrant ID."]);
            $verifyStmt->close();
            $conn->close();
            exit();
        }
        $verifyStmt->close();

        $stmt = $conn->prepare("INSERT INTO tree_name_tag (name, registrant_id, deleted) VALUES (?, ?, 0)");
        $stmt->bind_param("si", $treeName, $registrantId);

        if ($stmt->execute()) {
            error_log("Tree name inserted successfully with id: " . $stmt->insert_id);
            echo json_encode(["success" => "Tree name added successfully.", "id" => $stmt->insert_id, "name" => $treeName]);
        } else {
            error_log("Failed to insert tree name: " . $stmt->error);
            http_response_code(500);
            echo json_encode(["error" => $stmt->error]);
        }

        $stmt->close();
        $conn->close();
        exit();
    }

    // GET TREE NAMES
    elseif ($action === 'getTreeNames') {
        $registrantId = intval($_POST['registrantId'] ?? 0);
        if ($registrantId <= 0) {
            http_response_code(400);
            echo json_encode(["error" => "Registrant ID is required."]);
            $conn->close();
            exit();
        }

        $stmt = $conn->prepare("SELECT id, name FROM tree_name_tag WHERE deleted = 0 AND registrant_id = ? ORDER BY id DESC");
        $stmt->bind_param("i", $registrantId);
        $stmt->execute();
        $result = $stmt->get_result();

        $treeNames = [];
        while ($row = $result->fetch_assoc()) {
            $treeNames[] = $row;
        }
        $stmt->close();

        echo json_encode($treeNames);
        $conn->close();
        exit();
    }

    // EDIT TREE NAME
    elseif ($action === 'editTreeName') {
        $id = intval($_POST['id'] ?? 0);
        $newName = trim($_POST['newName'] ?? '');
        $registrantId = intval($_POST['registrantId'] ?? 0);

        if ($id <= 0 || empty($newName) || $registrantId <= 0) {
            http_response_code(400);
            echo json_encode(["error" => "Invalid input."]);
            $conn->close();
            exit();
        }

        $stmt = $conn->prepare("UPDATE tree_name_tag SET name = ? WHERE id = ? AND registrant_id = ?");
        $stmt->bind_param("sii", $newName, $id, $registrantId);

        if ($stmt->execute()) {
            echo json_encode(["success" => "Tree name updated successfully.", "id" => $id, "name" => $newName]);
        } else {
            http_response_code(500);
            echo json_encode(["error" => $stmt->error]);
        }

        $stmt->close();
        $conn->close();
        exit();
    }

    // DELETE TREE NAME
    elseif ($action === 'softDeleteTreeName') {
        $id = intval($_POST['id'] ?? 0);
        $registrantId = intval($_POST['registrantId'] ?? 0);

        if ($id <= 0 || $registrantId <= 0) {
            http_response_code(400);
            echo json_encode(["error" => "Invalid tree name ID or registrant ID."]);
            $conn->close();
            exit();
        }

        $stmt = $conn->prepare("UPDATE tree_name_tag SET deleted = 1 WHERE id = ? AND registrant_id = ?");
        $stmt->bind_param("ii", $id, $registrantId);

        if ($stmt->execute()) {
            echo json_encode(["success" => "Tree name deleted successfully."]);
        } else {
            http_response_code(500);
            echo json_encode(["error" => $stmt->error]);
        }

        $stmt->close();
        $conn->close();
        exit();
    }
}

// Invalid method fallback
http_response_code(405);
echo json_encode(["error" => "Method not allowed."]);
$conn->close();
exit();
?>