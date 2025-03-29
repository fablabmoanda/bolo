<?php
// Include config file to get the allowed origin
if (file_exists(__DIR__ . '/../config.php')) {
    require_once __DIR__ . '/../config.php';
}

// Get the allowed origin from config or use a default
$allowed_origin = isset($api_config['allow_origin']) ? $api_config['allow_origin'] : 'http://localhost:8080';

// Set CORS headers for all requests
header("Access-Control-Allow-Origin: $allowed_origin");
header("Access-Control-Allow-Methods: GET, POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type");
header("Access-Control-Max-Age: 3600");

// Handle preflight OPTIONS requests
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(204);
    exit;
}
?>