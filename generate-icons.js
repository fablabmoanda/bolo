// Ce script est un exemple de génération d'icônes
// Pour l'exécuter, vous auriez besoin d'installer sharp:
// npm install sharp

/*
const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

const sizes = [72, 96, 128, 144, 152, 192, 384, 512];
const svgPath = path.join(__dirname, 'icons', 'icon-512x512.svg');

async function generateIcons() {
  try {
    // Vérifier si le dossier icons existe
    if (!fs.existsSync(path.join(__dirname, 'icons'))) {
      fs.mkdirSync(path.join(__dirname, 'icons'));
    }

    // Générer les icônes pour chaque taille
    for (const size of sizes) {
      await sharp(svgPath)
        .resize(size, size)
        .png()
        .toFile(path.join(__dirname, 'icons', `icon-${size}x${size}.png`));
      
      console.log(`Icône ${size}x${size} générée avec succès`);
    }

    console.log('Toutes les icônes ont été générées avec succès');
  } catch (error) {
    console.error('Erreur lors de la génération des icônes:', error);
  }
}

generateIcons();
*/

console.log(`
Pour générer les icônes, vous pouvez:

1. Installer sharp: npm install sharp
2. Décommenter le code dans ce fichier
3. Exécuter: node generate-icons.js

Alternativement, vous pouvez utiliser un service en ligne comme:
- https://app-manifest.firebaseapp.com/
- https://www.pwabuilder.com/

Pour convertir votre SVG en plusieurs tailles d'icônes PNG.
`); 