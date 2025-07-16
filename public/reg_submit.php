<?php
session_start();
require_once 'php/configuration.php';

if (!isset($_SESSION['user_id'])) {
    die("User not logged in.");
}

$user_id = $_SESSION['user_id'];

// ✅ Fetch email from users table using id
$user_email_stmt = $conn->prepare("SELECT email FROM users WHERE id = ?");
if (!$user_email_stmt) {
    die("Failed to prepare user email statement: " . $conn->error);
}
$user_email_stmt->bind_param("i", $user_id);
$user_email_stmt->execute();
$user_email_result = $user_email_stmt->get_result();

if ($user_email_result->num_rows === 0) {
    die("No user found with the given session ID.");
}
$user_email_row = $user_email_result->fetch_assoc();
$email = $user_email_row['email'];
$user_email_stmt->close();

if ($_SERVER["REQUEST_METHOD"] === "POST") {
    // Sanitize inputs
    $full_name = trim($_POST['full_name']);
    $mobile = trim($_POST['mobile']);
    $company_name = trim($_POST['company_name']);
    $role = trim($_POST['role']);
    $contact_method = $_POST['contact_method'];
    $certificate_name = trim($_POST['certificate_name']);
    $dashboard_pref = $_POST['dashboard_pref'];
    $gift_pref = $_POST['gift_pref'];
    $notification_pref = isset($_POST['notification_pref']) ? implode(",", $_POST['notification_pref']) : 'none';
    $zoom_call = $_POST['zoom_call'];
    $agreement = isset($_POST['agreement']) ? 1 : 0;
    $tree_count = intval($_POST['tree_count']);
    $package_type = trim($_POST['package_type']);
    $total_amount = isset($_POST['totalAmount']) ? floatval($_POST['totalAmount']) : 0.00;

    if (empty($full_name) || empty($package_type)) {
        die("Missing required fields: full_name or package_type");
    }

    // Check if package exists
    $package_stmt = $conn->prepare("SELECT package_id FROM packages WHERE LOWER(package_type) = LOWER(?)");
    $package_stmt->bind_param("s", $package_type);
    $package_stmt->execute();
    $package_result = $package_stmt->get_result();

    $package_id = null;
    if ($package_result->num_rows > 0) {
        $package_id = $package_result->fetch_assoc()['package_id'];
    } else {
        $normalized_type = strtolower($package_type);
        $mappings = ['grower' => 'Grower', 'legacy' => 'Legacy'];
        if (isset($mappings[$normalized_type])) {
            $correct_type = $mappings[$normalized_type];
            $create_stmt = $conn->prepare("INSERT INTO packages (package_type) VALUES (?)");
            $create_stmt->bind_param("s", $correct_type);
            if ($create_stmt->execute()) {
                $package_id = $create_stmt->insert_id;
            }
            $create_stmt->close();
        }
    }
    $package_stmt->close();

    if (!$package_id) die("Invalid or unknown package type.");

    // Generate custom_id
    $prefix = (strtolower($package_type) === 'grower') ? 'ANIYA-GW-' : 'ANIYA-LG-';
    $check_column = $conn->query("SHOW COLUMNS FROM registrants LIKE 'custom_id'");
    if ($check_column->num_rows == 0) {
        $conn->query("ALTER TABLE registrants ADD COLUMN custom_id VARCHAR(20) UNIQUE AFTER agreement");
    }

    $id_check_stmt = $conn->prepare("SELECT COUNT(*) as count FROM registrants WHERE custom_id LIKE CONCAT(?, '%')");
    $id_check_stmt->bind_param("s", $prefix);
    $id_check_stmt->execute();
    $id_count = $id_check_stmt->get_result()->fetch_assoc()['count'];
    $id_check_stmt->close();

    $custom_number = str_pad($id_count + 1, 3, "0", STR_PAD_LEFT);
    $custom_id = $prefix . $custom_number;

    // Insert into registrants
    $stmt = $conn->prepare("INSERT INTO registrants 
        (user_id, full_name, email, mobile, company_name, role, contact_method, certificate_name, dashboard_pref, gift_pref, notification_pref, zoom_call, agreement, custom_id)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)");
    $stmt->bind_param("isssssssssssis", $user_id, $full_name, $email, $mobile, $company_name, $role, $contact_method, $certificate_name, $dashboard_pref, $gift_pref, $notification_pref, $zoom_call, $agreement, $custom_id);

    if ($stmt->execute()) {
        $registrant_id = $stmt->insert_id;
        $stmt->close();

        // registrant_packages
        $stmt2 = $conn->prepare("INSERT INTO registrant_packages (registrant_id, package_id, tree_count) VALUES (?, ?, ?)");
        $stmt2->bind_param("iii", $registrant_id, $package_id, $tree_count);
        $stmt2->execute();
        $stmt2->close();

        // registrant_crops
        if (!empty($_POST['crops'])) {
            foreach ($_POST['crops'] as $crop_name) {
                $crop_q = $conn->prepare("SELECT crop_id FROM crops WHERE crop_name = ?");
                $crop_q->bind_param("s", $crop_name);
                $crop_q->execute();
                $crop_r = $crop_q->get_result();
                if ($crop_r->num_rows > 0) {
                    $crop_id = $crop_r->fetch_assoc()['crop_id'];
                    $crop_stmt = $conn->prepare("INSERT INTO registrant_crops (registrant_id, crop_id) VALUES (?, ?)");
                    $crop_stmt->bind_param("ii", $registrant_id, $crop_id);
                    $crop_stmt->execute();
                    $crop_stmt->close();
                }
                $crop_q->close();
            }
        }

        // registrant_livestock
        if (!empty($_POST['livestock'])) {
            foreach ($_POST['livestock'] as $livestock_type) {
                $livestock_q = $conn->prepare("SELECT livestock_id FROM livestock WHERE livestock_type = ?");
                $livestock_q->bind_param("s", $livestock_type);
                $livestock_q->execute();
                $livestock_r = $livestock_q->get_result();
                if ($livestock_r->num_rows > 0) {
                    $livestock_id = $livestock_r->fetch_assoc()['livestock_id'];
                    $livestock_stmt = $conn->prepare("INSERT INTO registrant_livestock (registrant_id, livestock_id) VALUES (?, ?)");
                    $livestock_stmt->bind_param("ii", $registrant_id, $livestock_id);
                    $livestock_stmt->execute();
                    $livestock_stmt->close();
                }
                $livestock_q->close();
            }
        }

        // payments
        if (!empty($_POST['paymentMethod']) && $total_amount > 0) {
            $payment_method = $_POST['paymentMethod'];
            $proof = $_FILES['paymentProof']['name'] ?? null;
            $targetPath = null;

            if ($proof) {
                $allowed = ['jpg', 'jpeg', 'png', 'gif', 'pdf'];
                $ext = strtolower(pathinfo($proof, PATHINFO_EXTENSION));
                if (in_array($ext, $allowed)) {
                    $filename = time() . '_' . $registrant_id . '.' . $ext;
                    $targetPath = 'uploads/' . $filename;
                    if (!is_dir('uploads')) mkdir('uploads', 0755, true);
                    move_uploaded_file($_FILES['paymentProof']['tmp_name'], $targetPath);
                }
            }

            $stmt3 = $conn->prepare("INSERT INTO payments (registrant_id, payment_method, total_amount, payment_proof) VALUES (?, ?, ?, ?)");
            $stmt3->bind_param("isds", $registrant_id, $payment_method, $total_amount, $targetPath);
            $stmt3->execute();
            $stmt3->close();
        }

            // ✅ SUCCESS - Fixed redirect
        error_log("Registration successful for user ID: " . $user_id . ", registrant ID: " . $registrant_id);
        
        header("Location: thankyou_afterform.php?custom_id=" . urlencode($custom_id));
        exit();

    } else {
        error_log("Registration failed: " . $stmt->error);
        echo "Registration failed: " . $stmt->error;
    }

    $conn->close();
} else {
    echo "Invalid request method.";
}
?>
