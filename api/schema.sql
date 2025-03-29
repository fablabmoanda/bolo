-- Création de la base de données
CREATE DATABASE IF NOT EXISTS clavier_db;
USE clavier_db;

-- Table principale pour stocker les entrées
CREATE TABLE IF NOT EXISTS saisies (
    id INT PRIMARY KEY AUTO_INCREMENT,
    code VARCHAR(255) NOT NULL,
    motif VARCHAR(255) NOT NULL,
    creele TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Exemple de données de test
INSERT INTO saisies (code, motif) VALUES
('ABC123', 'Motif test 1'),
('DEF456', 'Motif test 2');