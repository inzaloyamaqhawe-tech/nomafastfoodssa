<?php
header('Content-Type: application/json');

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
  http_response_code(405);
  echo json_encode(['ok' => false, 'error' => 'Method not allowed']);
  exit;
}

$raw = file_get_contents('php://input');
$data = json_decode($raw, true);

if (!$data || !is_array($data)) {
  http_response_code(400);
  echo json_encode(['ok' => false, 'error' => 'Invalid JSON payload']);
  exit;
}

$name = trim($data['name'] ?? '');
$phone = trim($data['phone'] ?? '');
$date = trim($data['date'] ?? '');
$time = trim($data['time'] ?? '');
$guests = trim($data['guests'] ?? '');
$message = trim($data['message'] ?? '');
$orderItems = $data['orderItems'] ?? [];
$orderTotalZar = $data['orderTotalZar'] ?? 0;

if (!is_array($orderItems)) {
  $orderItems = [];
}

if ($name === '' || $phone === '' || $date === '' || $time === '') {
  http_response_code(422);
  echo json_encode(['ok' => false, 'error' => 'Name, phone, date, and time are required']);
  exit;
}

$record = [
  'id' => uniqid('noma_', true),
  'name' => $name,
  'phone' => $phone,
  'date' => $date,
  'time' => $time,
  'guests' => $guests,
  'message' => $message,
  'orderItems' => $orderItems,
  'orderTotalZar' => round((float)$orderTotalZar, 2),
  'createdAt' => date('c')
];

$file = __DIR__ . DIRECTORY_SEPARATOR . 'noma_bookings.json';
$bookings = [];

if (file_exists($file)) {
  $existing = json_decode(file_get_contents($file), true);
  if (is_array($existing)) {
    $bookings = $existing;
  }
}

$bookings[] = $record;

if (file_put_contents($file, json_encode($bookings, JSON_PRETTY_PRINT)) === false) {
  http_response_code(500);
  echo json_encode(['ok' => false, 'error' => 'Failed to save booking']);
  exit;
}

echo json_encode(['ok' => true, 'message' => 'Booking saved successfully', 'bookingId' => $record['id']]);
