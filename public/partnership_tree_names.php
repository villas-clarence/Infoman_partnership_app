<?php
header("Content-Type: application/json; charset=UTF-8");
mysqli_report(MYSQLI_REPORT_ERROR | MYSQLI_REPORT_STRICT);

$conn = new mysqli("localhost", "root", "", "aniya_database");
$conn->set_charset("utf8mb4");

$method = $_SERVER['REQUEST_METHOD'];

switch ($method) {
    case 'GET':
        $result = $conn->query("SELECT id, tree_name FROM partnership_tree_names ORDER BY id ASC");
        $treeNames = [];
        while ($row = $result->fetch_assoc()) {
            $treeNames[] = $row;
        }
        echo json_encode(["success" => true, "treeNames" => $treeNames]);
        break;

    case 'POST':
        $data = json_decode(file_get_contents("php://input"), true);
        $treeName = $conn->real_escape_string(trim($data['tree_name'] ?? ''));
        if ($treeName === '') {
            echo json_encode(["success" => false, "error" => "Tree name cannot be empty"]);
            exit();
        }
        $stmt = $conn->prepare("INSERT INTO partnership_tree_names (tree_name) VALUES (?)");
        $stmt->bind_param("s", $treeName);
        if ($stmt->execute()) {
            echo json_encode(["success" => true, "id" => $stmt->insert_id, "tree_name" => $treeName]);
        } else {
            echo json_encode(["success" => false, "error" => "Failed to add tree name"]);
        }
        $stmt->close();
        break;

    case 'PUT':
        $data = json_decode(file_get_contents("php://input"), true);
        $id = intval($data['id'] ?? 0);
        $treeName = $conn->real_escape_string(trim($data['tree_name'] ?? ''));
        if ($id <= 0 || $treeName === '') {
            echo json_encode(["success" => false, "error" => "Invalid input"]);
            exit();
        }
        $stmt = $conn->prepare("UPDATE partnership_tree_names SET tree_name = ? WHERE id = ?");
        $stmt->bind_param("si", $treeName, $id);
        if ($stmt->execute()) {
            echo json_encode(["success" => true, "id" => $id, "tree_name" => $treeName]);
        } else {
            echo json_encode(["success" => false, "error" => "Failed to update tree name"]);
        }
        $stmt->close();
        break;

    case 'DELETE':
        parse_str(file_get_contents("php://input"), $delete_vars);
        $id = intval($delete_vars['id'] ?? 0);
        if ($id <= 0) {
            echo json_encode(["success" => false, "error" => "Invalid ID"]);
            exit();
        }
        $stmt = $conn->prepare("DELETE FROM partnership_tree_names WHERE id = ?");
        $stmt->bind_param("i", $id);
        if ($stmt->execute()) {
            echo json_encode(["success" => true, "id" => $id]);
        } else {
            echo json_encode(["success" => false, "error" => "Failed to delete tree name"]);
        }
        $stmt->close();
        break;

    default:
        http_response_code(405);
        echo json_encode(["success" => false, "error" => "Method not allowed"]);
        break;
}

$conn->close();
