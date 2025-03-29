<?php
// Configuration de la base de données (avec valeurs par défaut)
$dbHost = 'mysql-mende.alwaysdata.net';
$dbName = 'mende_vocabard';
$dbUser = 'mende';
$dbPass = 'Men5P@sS';

// CORS headers - Allow both localhost and production domain
$allowedOrigins = [
    'http://localhost:8080',
    'https://bolo.fablabmoanda.com'
];

$origin = isset($_SERVER['HTTP_ORIGIN']) ? $_SERVER['HTTP_ORIGIN'] : '';

if (in_array($origin, $allowedOrigins)) {
    header("Access-Control-Allow-Origin: $origin");
}

header('Access-Control-Allow-Headers: X-Requested-With, Content-Type, Accept, Origin, Authorization');
header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, PATCH, OPTIONS');

// Handle preflight OPTIONS requests
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    header('HTTP/1.1 200 OK');
    exit();
}

// Connect to database
try {
    $pdo = new PDO("mysql:host=$dbHost;dbname=$dbName", $dbUser, $dbPass);
    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
} catch(PDOException $e) {
    header('Content-Type: application/json');
    echo json_encode([
        'status' => 'error',
        'message' => 'Erreur de connexion à la base de données'
    ]);
    exit();
}