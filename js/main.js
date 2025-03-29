// Configuration
const MIN_CODE_LENGTH = 4;
const MAX_CODE_LENGTH = 8;
let currentCode = '';

// Éléments DOM
const codeDisplay = document.getElementById('codeDisplay');
const interface1 = document.getElementById('interface1');
const interface2 = document.getElementById('interface2');

// Fonction pour vérifier si un caractère est un chiffre
function isDigit(char) {
    return /^\d$/.test(char);
}

// Fonction pour vérifier si un caractère est une lettre
function isLetter(char) {
    return /^[A-Z]$/.test(char);
}

// Fonction pour vérifier si le code est complet (se termine par 2 chiffres)
function isCodeComplete() {
    if (currentCode.length < 3) return false;
    const lastTwo = currentCode.slice(-2);
    return isDigit(lastTwo[0]) && isDigit(lastTwo[1]);
}

// Fonction pour vérifier si un caractère peut être ajouté
function canAddCharacter(char) {
    // Si le code est déjà complet, on n'ajoute plus rien
    if (isCodeComplete()) return false;

    // Si c'est le premier caractère, il doit être une lettre
    if (currentCode.length === 0) return isLetter(char);

    // Si le dernier caractère est un chiffre, on ne peut ajouter qu'un chiffre
    if (currentCode.length > 0 && isDigit(currentCode[currentCode.length - 1])) {
        return isDigit(char);
    }

    // Pour les deux dernières positions, on n'accepte que des chiffres
    // pour garantir que le code se termine toujours par 2 chiffres
    if (currentCode.length >= MAX_CODE_LENGTH - 2) return isDigit(char);

    // Pour les positions intermédiaires, on accepte lettres et chiffres
    return isLetter(char) || isDigit(char);
}

// Fonction pour créer les carrés de code
function createCodeSquares() {
    codeDisplay.innerHTML = '';
    
    // Déterminer le nombre de cellules à afficher
    let displayLength;
    
    if (isCodeComplete()) {
        // Si le code est complet, on affiche exactement le nombre de caractères saisis
        displayLength = currentCode.length;
    } else if (currentCode.length > 0 && isDigit(currentCode[currentCode.length - 1])) {
        // Si on a déjà commencé à saisir des chiffres, on n'affiche qu'une cellule supplémentaire
        displayLength = Math.max(MIN_CODE_LENGTH, currentCode.length + 1);
    } else {
        // Sinon, on affiche au moins deux cellules supplémentaires
        displayLength = Math.max(MIN_CODE_LENGTH, currentCode.length + 2);
    }
    
    const codeCompleted = isCodeComplete();
    
    for (let i = 0; i < displayLength; i++) {
        const square = document.createElement('div');
        square.className = 'code-digit';

        // Ajouter la classe digit si c'est un chiffre
        if (i < currentCode.length && isDigit(currentCode[i])) {
            square.classList.add('digit');
        }
        
        // N'ajouter la classe current que si le code n'est pas complet
        if (i === currentCode.length && !codeCompleted) {
            square.classList.add('current');
        } else if (i < currentCode.length) {
            square.classList.add('filled');
            
            // Appliquer le style pour code terminé
            if (codeCompleted) {
                if (isDigit(currentCode[i])) {
                    square.classList.add('completed-digit');
                } else {
                    square.classList.add('completed-letter');
                }
            }
        }

        square.textContent = i < currentCode.length ? currentCode[i] : '_';
        codeDisplay.appendChild(square);
    }
}

// Fonction pour mettre à jour l'affichage
function updateDisplay() {
    createCodeSquares();
}

// Fonction pour changer d'interface
function switchInterface() {
    // Forcer le changement d'interface en utilisant display: none/flex
    interface1.style.display = 'none';
    interface2.style.display = 'flex';
    
    // Forcer un reflow pour s'assurer que le changement est appliqué
    interface1.offsetHeight;
    interface2.offsetHeight;
    
    // Vérifier si nous sommes dans une PWA
    if (window.matchMedia('(display-mode: standalone)').matches) {
        // Forcer un rafraîchissement de l'affichage
        requestAnimationFrame(() => {
            interface1.style.display = 'none';
            interface2.style.display = 'flex';
        });
    }
}

// Fonction pour ajouter un caractère
function addCharacter(char) {
    if (currentCode.length < MAX_CODE_LENGTH && canAddCharacter(char)) {
        currentCode += char;
        updateDisplay();
        
        // Si le code est complet, changer d'interface après un court délai
        if (isCodeComplete()) {
            setTimeout(() => {
                switchInterface();
            }, 500); // Réduire le délai à 500ms pour une meilleure réactivité
        }
    }
}

// Fonction pour supprimer le dernier caractère
function deleteLastCharacter() {
    if (currentCode.length > 0) {
        currentCode = currentCode.slice(0, -1);
        updateDisplay();
    }
}

// Déterminer l'URL de base de l'API en fonction de l'environnement
function getApiBaseUrl() {
    // Vérifier si nous sommes en local ou en production
    const isLocalhost = window.location.hostname === 'localhost' || 
                        window.location.hostname === '127.0.0.1' ||
                        window.location.hostname.includes('192.168.');
    
    return isLocalhost ? 'http://localhost:8000' : 'https://bolo.fablabmoanda.com';
}

// URL de base de l'API
const API_BASE_URL = getApiBaseUrl();

// Fonction pour gérer la sélection des motifs
function handleMotifSelection(event) {
    // Éviter les soumissions multiples
    if (document.getElementById('loader-overlay')) {
        return; // Si le loader est déjà affiché, ne rien faire
    }
    
    // Retirer la classe selected de toutes les cartes
    document.querySelectorAll('.motif-card').forEach(card => {
        card.classList.remove('selected');
    });
    
    // Ajouter la classe selected à la carte cliquée
    const selectedCard = event.currentTarget;
    selectedCard.classList.add('selected');
    
    // Récupérer le motif sélectionné (le texte du h3)
    const motif = selectedCard.querySelector('h3').textContent.toLowerCase();
    
    // Créer l'objet de données
    const formData = {
        code: currentCode,
        motif: motif
    };
    
    // Afficher les données en console
    console.log('Données du formulaire :');
    console.log(JSON.stringify(formData, null, 2));
    
    // Afficher le loader
    showLoader();
    
    // Envoyer les données au serveur
    fetch(`${API_BASE_URL}/api/save.php`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData)
    })
    .then(response => {
        if (!response.ok) {
            throw new Error('Network response was not ok');
        }
        return response.json();
    })
    .then(data => {
        console.log('Succès:', data);
        hideLoader();
        showNotification('Enregistrement effectué');
        // Réinitialiser l'interface après 5 secondes
        setTimeout(() => {
            window.location.reload();
        }, 5000);
    })
    .catch(error => {
        console.error('Erreur:', error);
        hideLoader();
        showNotification('Erreur lors de l\'envoi des informations', true);
    });
}

// Fonction pour afficher le loader
function showLoader() {
    const loaderOverlay = document.createElement('div');
    loaderOverlay.id = 'loader-overlay';
    loaderOverlay.innerHTML = `
        <div class="loader-container">
            <div class="spinner-border text-light" role="status">
                <span class="visually-hidden">Chargement...</span>
            </div>
            <p class="mt-2 text-light">Traitement en cours...</p>
        </div>
    `;
    document.body.appendChild(loaderOverlay);
}

// Fonction pour cacher le loader
function hideLoader() {
    const loaderOverlay = document.getElementById('loader-overlay');
    if (loaderOverlay) {
        document.body.removeChild(loaderOverlay);
    }
}

// Initialisation des boutons du clavier
document.addEventListener('DOMContentLoaded', () => {
    // Afficher les carrés de code au chargement
    createCodeSquares();

    // Configuration des touches
    const rows = [
        ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9'],
        ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J'],
        ['K', 'L', 'M', 'N', 'O', 'P', 'Q', 'R', 'S', 'T'],
        ['U', 'V', 'W', 'X', 'Y', 'Z']
    ];

    // Création des boutons
    const keyboard = document.querySelector('.keyboard');
    keyboard.innerHTML = ''; // Nettoyer le contenu existant

    // Création des rangées de touches
    rows.forEach((row, rowIndex) => {
        const rowDiv = document.createElement('div');
        rowDiv.className = 'row g-2 mb-2 justify-content-center';

        // Ajouter le bouton de rechargement au début de la dernière ligne
        if (rowIndex === rows.length - 1) {
            const reloadCol = document.createElement('div');
            reloadCol.className = 'col-auto me-2';
            
            const reloadButton = document.createElement('button');
            reloadButton.className = 'btn btn-secondary aspect-ratio-1';
            reloadButton.innerHTML = '<i class="bi bi-arrow-clockwise"></i>';
            reloadButton.onclick = () => window.location.reload();

            reloadCol.appendChild(reloadButton);
            rowDiv.appendChild(reloadCol);
        }

        row.forEach(key => {
            const col = document.createElement('div');
            col.className = 'col-auto';

            const button = document.createElement('button');
            button.className = 'btn btn-light aspect-ratio-1';
            button.textContent = key;
            button.onclick = () => addCharacter(key);

            col.appendChild(button);
            rowDiv.appendChild(col);
        });

        // Ajouter le bouton Supprimer à la fin de la dernière ligne
        if (rowIndex === rows.length - 1) {
            const deleteCol = document.createElement('div');
            deleteCol.className = 'col-auto ms-2';
            
            const deleteButton = document.createElement('button');
            deleteButton.className = 'btn btn-danger d-flex align-items-center gap-2';
            deleteButton.innerHTML = '<i class="bi bi-backspace-fill"></i> Supprimer';
            deleteButton.onclick = deleteLastCharacter;

            deleteCol.appendChild(deleteButton);
            rowDiv.appendChild(deleteCol);
        }

        keyboard.appendChild(rowDiv);
    });

    // Gestionnaires pour les cartes de motif
    document.querySelectorAll('.motif-card').forEach(card => {
        card.addEventListener('click', handleMotifSelection);
    });
});


// After the user selects a visit reason
function handleVisitReasonSelection(reasonCode, reasonText) {
    // Get the previously entered code
    const enteredCode = document.getElementById('display').value;
    
    // Prepare data to send
    const data = {
        code: enteredCode,
        motif: reasonText,
        motifCode: reasonCode
    };
    
    // Send data to the server
    fetch(`${API_BASE_URL}/api/save.php`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(data)
    })
    .then(response => {
        if (!response.ok) {
            throw new Error('Network response was not ok');
        }
        return response.json();
    })
    .then(data => {
        console.log('Success:', data);
        // Show success message to user
        showNotification('Information envoyée avec succès');
        // Reset the interface
        resetInterface();
    })
    .catch(error => {
        console.error('Error:', error);
        // Show error message to user
        showNotification('Erreur lors de l\'envoi des informations', true);
    });
}

// Helper function to show notifications
function showNotification(message, isError = false) {
    const notification = document.createElement('div');
    notification.className = `notification ${isError ? 'error' : 'success'}`;
    notification.textContent = message;
    
    document.body.appendChild(notification);
    
    // Remove notification after 3 seconds
    setTimeout(() => {
        notification.classList.add('fade-out');
        setTimeout(() => {
            document.body.removeChild(notification);
        }, 500);
    }, 3000);
}

// Reset interface after submission
function resetInterface() {
    document.getElementById('display').value = '';
    // If you have a container for visit reasons that needs to be hidden
    const reasonsContainer = document.getElementById('visit-reasons-container');
    if (reasonsContainer) {
        reasonsContainer.style.display = 'none';
    }
    // Return to initial state
    showKeypad();
}

// Modify your existing code that handles the selection of a visit reason
// For example, if you have a function that's called when a reason is selected:
function onVisitReasonClick(event) {
    const reasonElement = event.target.closest('.reason-button');
    if (!reasonElement) return;
    
    const reasonCode = reasonElement.dataset.code;
    const reasonText = reasonElement.textContent.trim();
    
    // Call the function to handle the submission
    handleVisitReasonSelection(reasonCode, reasonText);
}

// Add event listeners to your reason buttons
document.querySelectorAll('.reason-button').forEach(button => {
    button.addEventListener('click', onVisitReasonClick);
});