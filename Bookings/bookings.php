<!-- In this file the booking data recieved from the xhr will be sent to bookings.jsonl file -->
<?php
header('Content-Type: application/json; charset=utf-8');

$raw = file_get_contents('php://input');
$data = json_decode($raw, true);

if (!is_array($data)) {
    http_response_code(400);
    echo json_encode(['success' => false, 'message' => 'Invalid JSON']);
    exit;
}

// Basic validation 
$required = ['name','email','checkin','checkout'];
foreach ($required as $r) {
    if (empty($data[$r])) {
        http_response_code(422);
        echo json_encode(['success' => false, 'message' => "Missing field: $r"]);
        exit;
    }
}

// Sanitizing data
$entry = [
    'name' => filter_var($data['name'], FILTER_SANITIZE_STRING),
    'email' => filter_var($data['email'], FILTER_VALIDATE_EMAIL) ? $data['email'] : '',
    'checkin' => $data['checkin'],
    'checkout' => $data['checkout'],
    'roomType' => $data['roomType'] ?? '',
    'guests' => $data['guests'] ?? '',
    'timestamp' => date('c')
];

// Append to JSON lines file
$file = __DIR__ . '/bookings.jsonl';
file_put_contents($file, json_encode($entry, JSON_UNESCAPED_UNICODE) . PHP_EOL, FILE_APPEND | LOCK_EX);

echo json_encode(['success' => true, 'message' => 'Booking received', 'data' => $entry]);