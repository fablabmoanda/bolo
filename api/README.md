# API Web Clavier

Ce projet est une API Web simple construite avec PHP et le framework Slim.

## Prérequis

- PHP 8.1 ou supérieur
- Composer
- Serveur web (Apache/Nginx)

## Installation

1. Cloner le repository
2. Installer les dépendances :
```bash
composer install
```

## Configuration du serveur web

### Apache
Assurez-vous que le module `mod_rewrite` est activé et que le document root pointe vers le dossier `public/`.

### Nginx
Ajoutez la configuration suivante à votre fichier de configuration :
```nginx
location / {
    try_files $uri $uri/ /index.php?$query_string;
}
```

## Utilisation

L'API expose une route POST `/save` qui accepte des données JSON.

Exemple de requête :
```bash
curl -X POST http://localhost/save \
     -H "Content-Type: application/json" \
     -d '{"key": "value"}'
```

## Structure du projet

- `public/` : Point d'entrée de l'application
- `src/` : Code source de l'application
- `vendor/` : Dépendances (créé après `composer install`) 