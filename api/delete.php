<?php
// Inclure le fichier de configuration
require_once 'config.php';

// Vérifier que la méthode est DELETE
if ($_SERVER['REQUEST_METHOD'] !== 'DELETE') {
    header('HTTP/1.1 405 Method Not Allowed');
    header('Content-Type: application/json');
    echo json_encode([
        'status' => 'error',
        'message' => 'Méthode non autorisée'
    ]);
    exit();
}

// Récupérer les données envoyées
$data = json_decode(file_get_contents('php://input'), true);

// Vérifier que l'ID est présent
if (!isset($data['id']) || empty($data['id'])) {
    header('HTTP/1.1 400 Bad Request');
    header('Content-Type: application/json');
    echo json_encode([
        'status' => 'error',
        'message' => 'ID manquant'
    ]);
    exit();
}

$id = $data['id'];

try {
    // Préparer la requête de suppression
    $stmt = $pdo->prepare('DELETE FROM saisies WHERE id = :id');
    $stmt->bindParam(':id', $id, PDO::PARAM_INT);
    
    // Exécuter la requête
    if ($stmt->execute()) {
        // Vérifier si un enregistrement a été supprimé
        if ($stmt->rowCount() > 0) {
            header('Content-Type: application/json');
            echo json_encode([
                'status' => 'success',
                'message' => 'Enregistrement supprimé avec succès'
            ]);
        } else {
            header('HTTP/1.1 404 Not Found');
            header('Content-Type: application/json');
            echo json_encode([
                'status' => 'error',
                'message' => 'Aucun enregistrement trouvé avec cet ID'
            ]);
        }
    } else {
        throw new Exception('Erreur lors de la suppression');
    }
} catch (Exception $e) {
    header('HTTP/1.1 500 Internal Server Error');
    header('Content-Type: application/json');
    echo json_encode([
        'status' => 'error',
        'message' => 'Erreur lors de la suppression: ' . $e->getMessage()
    ]);
}