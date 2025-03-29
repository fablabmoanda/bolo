<?php
require_once 'config.php';  // Changed from '../config.php' to 'config.php'

// Only allow GET requests
if ($_SERVER['REQUEST_METHOD'] !== 'GET') {
    header('Content-Type: application/json');
    header('HTTP/1.1 405 Method Not Allowed');
    echo json_encode([
        'error' => 'Méthode non autorisée',
        'allowed_methods' => ['GET']
    ]);
    exit();
}

// Get data from database
try {
    $stmt = $pdo->query("SELECT * FROM saisies ORDER BY creele DESC");
    $saisies = $stmt->fetchAll(PDO::FETCH_ASSOC);
    
    header('Content-Type: application/json');
    echo json_encode([
        'status' => 'success',
        'data' => $saisies
    ]);
} catch(PDOException $e) {
    header('Content-Type: application/json');
    header('HTTP/1.1 500 Internal Server Error');
    echo json_encode([
        'status' => 'error',
        'message' => 'Erreur lors de la récupération des données'
    ]);
}