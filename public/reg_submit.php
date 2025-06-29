<?php
$host = "localhost";
$user = "root";
$password = "";
$dbname = "aniya_database";

$conn = new mysqli($host, $user, $password, $dbname);
if ($conn->connect_error) {
    die("Connection failed: " . $conn->connect_error);
}

$upload_dir = "uploads/";
$payment_proof_path = "";
if (!empty($_FILES["paymentProof"]["name"])) {
    $filename = basename($_FILES["paymentProof"]["name"]);
    $target_path = $upload_dir . uniqid() . "_" . $filename;
    if (!is_dir($upload_dir)) mkdir($upload_dir);
    if (move_uploaded_file($_FILES["paymentProof"]["tmp_name"], $target_path)) {
        $payment_proof_path = $target_path;
    }
}

function clean($val) {
    return htmlspecialchars(trim($val));
}

$fullName = clean($_POST["fullName"]);
$email = clean($_POST["email"]);
$mobile = clean($_POST["mobile"]);
$company = clean($_POST["company"]);
$role = clean($_POST["role"]);
$contactMethod = $_POST["contactMethod"] ?? "";
$certificateName = clean($_POST["certificateName"]);
$dashboard = $_POST["dashboard"] ?? "";
$gift = $_POST["gift"] ?? "";
$zoomCall = $_POST["zoomCall"] ?? "";
$notification = isset($_POST["notification"]) ? implode(", ", $_POST["notification"]) : "";
$agreement = isset($_POST["agreement"]) ? 1 : 0;
$package_type = $_POST["package"] ?? "";
$tree_count = intval($_POST["treeCount"] ?? 0);
$paymentMethod = $_POST["paymentMethod"] ?? "";
$totalAmount = floatval($_POST["totalAmount"] ?? 0);

$registrant_id = $_POST['registrant_id'] ?? null;

if ($registrant_id) {
    $stmt = $conn->prepare("UPDATE registrants SET full_name=?, email=?, mobile=?, company_name=?, role=?, contact_method=?, certificate_name=?, dashboard_pref=?, gift_pref=?, notification_pref=?, zoom_call=?, agreement=? WHERE registrant_id=?");
    $stmt->bind_param("ssssssssssssi", $fullName, $email, $mobile, $company, $role, $contactMethod, $certificateName, $dashboard, $gift, $notification, $zoomCall, $agreement, $registrant_id);
    $stmt->execute();
    $stmt->close();

    echo "<script>
      const registrant = " . json_encode([
        'registrant_id' => $registrant_id,
        'full_name' => $fullName,
        'email' => $email,
        'mobile' => $mobile,
        'company' => $company,
        'role' => $role,
        'contact_method' => $contactMethod,
        'certificate_name' => $certificateName,
        'dashboard_pref' => $dashboard,
        'gift_pref' => $gift,
        'zoom_call' => $zoomCall,
        'notification_pref' => $notification
      ]) . ";
      localStorage.setItem('editRegistrant', JSON.stringify(registrant));
      window.location.href = 'thankyou_afterform.html';
    </script>";
} else {
    $stmt = $conn->prepare("INSERT INTO registrants (full_name, email, mobile, company_name, role, contact_method, certificate_name, dashboard_pref, gift_pref, notification_pref, zoom_call, agreement, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW())");
    $stmt->bind_param("sssssssssssi", $fullName, $email, $mobile, $company, $role, $contactMethod, $certificateName, $dashboard, $gift, $notification, $zoomCall, $agreement);
    if (!$stmt->execute()) {
        die("Error saving registrant: " . $stmt->error);
    }
    $registrant_id = $stmt->insert_id;
    $stmt->close();

    $package_check = $conn->prepare("SELECT package_id FROM packages WHERE package_type = ?");
    $package_check->bind_param("s", $package_type);
    $package_check->execute();
    $result = $package_check->get_result();
    if ($row = $result->fetch_assoc()) {
        $package_id = $row["package_id"];
    } else {
        $insert_package = $conn->prepare("INSERT INTO packages (package_type) VALUES (?)");
        $insert_package->bind_param("s", $package_type);
        $insert_package->execute();
        $package_id = $insert_package->insert_id;
        $insert_package->close();
    }
    $package_check->close();

    $insert_pkg = $conn->prepare("INSERT INTO registrant_packages (registrant_id, package_id, tree_count) VALUES (?, ?, ?)");
    $insert_pkg->bind_param("iii", $registrant_id, $package_id, $tree_count);
    $insert_pkg->execute();
    $insert_pkg->close();

    if (isset($_POST["crops"])) {
        foreach ($_POST["crops"] as $crop) {
            $c_stmt = $conn->prepare("SELECT crop_id FROM crops WHERE crop_name = ?");
            $c_stmt->bind_param("s", $crop);
            $c_stmt->execute();
            $res = $c_stmt->get_result();
            if ($row = $res->fetch_assoc()) {
                $crop_id = $row["crop_id"];
            } else {
                $insert_crop = $conn->prepare("INSERT INTO crops (crop_name) VALUES (?)");
                $insert_crop->bind_param("s", $crop);
                $insert_crop->execute();
                $crop_id = $insert_crop->insert_id;
                $insert_crop->close();
            }
            $c_stmt->close();
            $link = $conn->prepare("INSERT INTO registrant_crops (registrant_id, crop_id) VALUES (?, ?)");
            $link->bind_param("ii", $registrant_id, $crop_id);
            $link->execute();
            $link->close();
        }
    }

    if (isset($_POST["livestock"])) {
        foreach ($_POST["livestock"] as $animal) {
            $l_stmt = $conn->prepare("SELECT livestock_id FROM livestock WHERE livestock_type = ?");
            $l_stmt->bind_param("s", $animal);
            $l_stmt->execute();
            $res = $l_stmt->get_result();
            if ($row = $res->fetch_assoc()) {
                $livestock_id = $row["livestock_id"];
            } else {
                $insert_livestock = $conn->prepare("INSERT INTO livestock (livestock_type) VALUES (?)");
                $insert_livestock->bind_param("s", $animal);
                $insert_livestock->execute();
                $livestock_id = $insert_livestock->insert_id;
                $insert_livestock->close();
            }
            $l_stmt->close();
            $link = $conn->prepare("INSERT INTO registrant_livestock (registrant_id, livestock_id) VALUES (?, ?)");
            $link->bind_param("ii", $registrant_id, $livestock_id);
            $link->execute();
            $link->close();
        }
    }

    $pay_stmt = $conn->prepare("INSERT INTO payments (registrant_id, payment_method, total_amount, payment_proof) VALUES (?, ?, ?, ?)");
    $pay_stmt->bind_param("isds", $registrant_id, $paymentMethod, $totalAmount, $payment_proof_path);
    $pay_stmt->execute();
    $pay_stmt->close();

    echo "<script>
      const registrant = " . json_encode([
        'registrant_id' => $registrant_id,
        'full_name' => $fullName,
        'email' => $email,
        'mobile' => $mobile,
        'company' => $company,
        'role' => $role,
        'contact_method' => $contactMethod,
        'certificate_name' => $certificateName,
        'dashboard_pref' => $dashboard,
        'gift_pref' => $gift,
        'zoom_call' => $zoomCall,
        'notification_pref' => $notification
      ]) . ";
      localStorage.setItem('editRegistrant', JSON.stringify(registrant));
      window.location.href = 'thankyou_afterform.html';
    </script>";
}

$conn->close();
