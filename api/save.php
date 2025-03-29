<?php
require_once 'config.php';

// Only allow POST requests
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    header('Content-Type: application/json');
    header('HTTP/1.1 405 Method Not Allowed');
    echo json_encode([
        'error' => 'Méthode non autorisée',
        'allowed_methods' => ['POST']
    ]);
    exit();
}

// Get JSON data
$json = file_get_contents('php://input');
$data = json_decode($json, true);

// Validate data
if (empty($data['code']) || empty($data['motif'])) {
    header('Content-Type: application/json');
    header('HTTP/1.1 400 Bad Request');
    echo json_encode([
        'status' => 'error',
        'message' => 'Données manquantes'
    ]);
    exit();
}

// Insert into database
try {
    $stmt = $pdo->prepare("INSERT INTO saisies (code, motif) VALUES (:code, :motif)");
    $stmt->execute([
        ':code' => $data['code'],
        ':motif' => $data['motif']
    ]);
    
    header('Content-Type: application/json');
    echo json_encode([
        'status' => 'success',
        'message' => 'Données enregistrées avec succès',
        'id' => $pdo->lastInsertId()
    ]);
} catch(PDOException $e) {
    header('Content-Type: application/json');
    header('HTTP/1.1 500 Internal Server Error');
    echo json_encode([
        'status' => 'error',
        'message' => 'Erreur lors de la sauvegarde'
    ]);
}