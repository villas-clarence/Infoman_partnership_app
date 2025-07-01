<?php
header("Content-Type: application/json; charset=UTF-8");
mysqli_report(MYSQLI_REPORT_ERROR | MYSQLI_REPORT_STRICT);

$conn = new mysqli("localhost", "root", "", "aniya_database");
$conn->set_charset("utf8mb4");

$sql = "
SELECT 
  r.registrant_id,
  r.full_name,
  r.email,
  r.mobile,
  r.company_name,
  r.role,
  p.package_type AS package_name,
  rp.tree_count,
  COALESCE((
    SELECT GROUP_CONCAT(c.crop_name SEPARATOR ', ')
    FROM registrant_crops rc
    JOIN crops c ON rc.crop_id = c.crop_id
    WHERE rc.registrant_id = r.registrant_id
  ), '') AS crops,
  COALESCE((
    SELECT GROUP_CONCAT(l.livestock_type SEPARATOR ', ')
    FROM registrant_livestock rl
    JOIN livestock l ON rl.livestock_id = l.livestock_id
    WHERE rl.registrant_id = r.registrant_id
  ), '') AS livestock,
  pay.payment_proof
FROM registrants r
LEFT JOIN registrant_packages rp ON r.registrant_id = rp.registrant_id
LEFT JOIN packages p ON rp.package_id = p.package_id
LEFT JOIN payments pay ON r.registrant_id = pay.registrant_id
";
$result = $conn->query($sql);

$registrants = [];
while ($row = $result->fetch_assoc()) {
  $row['tree_count'] = (int)($row['tree_count'] ?? 0);
  $registrants[] = $row;
}

// Metrics
$total = count($registrants);
$grower = $legacy = $cropTotal = $livestockTotal = 0;
foreach ($registrants as $r) {
  if ($r['package_name'] === 'Grower Package' || $r['package_name'] === 'Grower') $grower++;
  if ($r['package_name'] === 'Legacy Package' || $r['package_name'] === 'Legacy') $legacy++;
  $cropTotal += $r['crops'] !== '' ? substr_count($r['crops'], ',') + 1 : 0;
  $livestockTotal += $r['livestock'] !== '' ? substr_count($r['livestock'], ',') + 1 : 0;
}

// Charts
$packageLabels = ['Grower', 'Legacy'];
$packageData = [$grower, $legacy];

$treeCounts = [];
foreach ($registrants as $r) {
  $treeCounts[$r['full_name']] = ($treeCounts[$r['full_name']] ?? 0) + $r['tree_count'];
}
arsort($treeCounts);
$topLabels = array_slice(array_keys($treeCounts), 0, 5);
$topData = array_slice(array_values($treeCounts), 0, 5);

// Build response
$response = [
  'registrants' => $registrants,
  'metrics' => [
    'total' => $total,
    'grower' => $grower,
    'legacy' => $legacy,
    'crops' => $cropTotal,
    'livestock' => $livestockTotal
  ],
  'charts' => [
    'package' => ['labels' => $packageLabels, 'data' => $packageData],
    'trees' => ['labels' => $topLabels, 'data' => $topData]
  ]
];

echo json_encode($response);
$conn->close();
