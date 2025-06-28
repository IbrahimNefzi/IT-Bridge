// Configuration Firebase
const firebaseConfig = {
    apiKey: "AIzaSyDtneirAz5uf9I_G5C9_iY2WSCfbD5b0vc",
    authDomain: "it-bridge-ca82b.firebaseapp.com",
    projectId: "it-bridge-ca82b",
    storageBucket: "it-bridge-ca82b.appspot.com",
    messagingSenderId: "264260582161",
    appId: "1:264260582161:web:4808e9146b3e1c7c4c6ab0"
};

// Initialiser Firebase
firebase.initializeApp(firebaseConfig);
const auth = firebase.auth();
const db = firebase.firestore();

// Variables globales
let currentUser = null;
let currentVideoIframe = null;
const ADMIN_EMAIL = "nefziibrahimd@gmail.com"; // Seul admin
let courses = [];
let courseListener = null;
let currentPage = 'auth'; // 'auth', 'main', 'reset', 'new-password'

// Fonction pour gérer la navigation
function navigateTo(page) {
    currentPage = page;
    renderApp();
}

// Fonction principale de rendu
function renderApp() {
    const appContainer = document.getElementById('appContainer');
    
    switch(currentPage) {
        case 'auth':
            appContainer.innerHTML = renderAuthPage();
            setupAuthListeners();
            break;
        case 'main':
            appContainer.innerHTML = renderMainApp();
            setupMainApp();
            break;
        case 'reset':
            appContainer.innerHTML = renderPasswordResetPage();
            setupResetListeners();
            break;
        case 'new-password':
            appContainer.innerHTML = renderNewPasswordPage();
            setupNewPasswordListeners();
            break;
    }
}

// Page d'authentification
function renderAuthPage() {
    return `
        <div class="auth-container">
            <div class="auth-card">
                <div class="auth-logo">🎓</div>
                <h1 class="auth-title">IT-Bridge</h1>
                
                <div class="auth-tabs">
                    <button class="auth-tab active" id="loginTab">Connexion</button>
                    <button class="auth-tab" id="registerTab">Inscription</button>
                </div>

                <div id="authAlert"></div>

                <!-- Formulaire de connexion -->
                <form id="loginForm" class="auth-form active">
                    <div class="form-group">
                        <label for="loginEmail">Email</label>
                        <input type="email" id="loginEmail" required>
                    </div>
                    <div class="form-group">
                        <label for="loginPassword">Mot de passe</label>
                        <input type="password" id="loginPassword" required>
                    </div>
                    <button type="submit" class="auth-btn" id="loginBtn">Se connecter</button>
                    <a href="reset_password.html" class="forgot-password">Mot de passe oublié ?</a>
                </form>

                <!-- Formulaire d'inscription -->
                <form id="registerForm" class="auth-form">
                    <div class="form-group">
                        <label for="registerName">Nom complet</label>
                        <input type="text" id="registerName" required>
                    </div>
                    <div class="form-group">
                        <label for="registerEmail">Email</label>
                        <input type="email" id="registerEmail" required>
                    </div>
                    <div class="form-group">
                        <label for="registerPassword">Mot de passe</label>
                        <input type="password" id="registerPassword" required minlength="6">
                    </div>
                    <button type="submit" class="auth-btn" id="registerBtn">Créer un compte</button>
                </form>
            </div>
        </div>
    `;
}

// Page de réinitialisation de mot de passe
function renderPasswordResetPage() {
    return `
        <div class="auth-container">
            <div class="auth-card">
                <div class="auth-logo">🔑</div>
                <h1 class="auth-title">Réinitialisation</h1>
                
                <div id="resetAlert"></div>
                
                <div class="form-group">
                    <label for="resetEmail">Votre adresse email</label>
                    <input type="email" id="resetEmail" placeholder="Entrez votre email enregistré">
                </div>
                <button class="auth-btn" id="sendResetBtn">Envoyer le lien</button>
                <button class="auth-btn" style="background: #666; margin-top: 10px;" id="cancelResetBtn">Annuler</button>
            </div>
        </div>
    `;
}

// Page de nouveau mot de passe
function renderNewPasswordPage() {
    const urlParams = new URLSearchParams(window.location.search);
    const email = urlParams.get('email') || '';
    
    return `
        <div class="auth-container">
            <div class="auth-card">
                <div class="auth-logo">🔒</div>
                <h1 class="auth-title">Nouveau mot de passe</h1>
                
                <div id="newPasswordAlert"></div>
                
                <p style="margin-bottom: 20px;">Créez un nouveau mot de passe pour: <strong>${email}</strong></p>
                
                <form id="newPasswordForm">
                    <div class="form-group">
                        <label for="newPassword">Nouveau mot de passe</label>
                        <input type="password" id="newPassword" required minlength="6">
                    </div>
                    <div class="form-group">
                        <label for="confirmPassword">Confirmer le mot de passe</label>
                        <input type="password" id="confirmPassword" required minlength="6">
                    </div>
                    <button type="submit" class="auth-btn">Changer le mot de passe</button>
                </form>
            </div>
        </div>
    `;
}

// Interface principale
function renderMainApp() {
    return `
        <div id="mainApp" class="main-app active">
            <div class="container">
                <header>
                    <div class="header-content">
                        <div class="logo">
                            <div style="font-size: 2rem;">📚</div>
                            <h1>IT-Bridge</h1>
                        </div>
                        
                        <div class="search-bar" id="studentSearchBar">
                            <input type="text" placeholder="Rechercher un cours..." id="searchInput">
                            <button onclick="searchCourses()">🔍</button>
                        </div>

                        <div class="user-info">
                            <div class="user-avatar" id="userAvatar"></div>
                            <div class="user-details">
                                <div class="user-name" id="userName"></div>
                                <div class="user-role" id="userRole"></div>
                            </div>
                            <button class="logout-btn" onclick="logout()">Déconnexion</button>
                        </div>
                    </div>
                </header>

                <div class="nav-tabs" id="navTabs"></div>

                <!-- Section Cours -->
                <div id="courses" class="content-section active">
                    <div class="course-grid" id="courseGrid">
                        <div class="loading">
                            <div class="spinner"></div>
                        </div>
                    </div>
                </div>

                <!-- Section Upload -->
                <div id="upload" class="content-section">
                    <div class="upload-section">
                        <h2 style="margin-bottom: 20px; color: #333;">📤 Gérer le contenu</h2>
                        
                        <div class="form-group">
                            <label for="contentType">Type de contenu</label>
                            <select id="contentType" onchange="toggleUploadFields()">
                                <option value="youtube">Vidéo YouTube</option>
                                <option value="drive">Fichier Google Drive</option>
                            </select>
                        </div>

                        <div id="youtubeFields">
                            <div class="form-group">
                                <label for="youtubeUrl">URL YouTube</label>
                                <input type="url" id="youtubeUrl" placeholder="https://www.youtube.com/watch?v=...">
                            </div>
                        </div>

                        <div id="driveFields" style="display:none;">
                            <div class="form-group">
                                <label for="driveUrl">Lien Google Drive</label>
                                <input type="url" id="driveUrl" placeholder="https://drive.google.com/file/d/...">
                            </div>
                            <div class="form-group">
                                <label for="fileType">Type de fichier</label>
                                <select id="fileType">
                                    <option value="video">Vidéo</option>
                                    <option value="pdf">PDF</option>
                                </select>
                            </div>
                        </div>

                        <!-- Pièces jointes Google Drive -->
                        <div class="drive-upload-container">
                            <h3>Pièces jointes via Google Drive</h3>
                            
                            <div class="drive-instructions">
                                <strong>Instructions:</strong>
                                <ol>
                                    <li>Uploader vos fichiers sur Google Drive</li>
                                    <li>Partager le fichier en mode "Toute personne disposant du lien peut consulter"</li>
                                    <li>Copier le lien de partage</li>
                                    <li>Coller le lien et donner un nom descriptif ci-dessous</li>
                                </ol>
                            </div>
                            
                            <div id="attachmentsContainer">
                                <div class="attachment-input">
                                    <input type="text" placeholder="Nom du fichier" class="attachment-name">
                                    <input type="text" placeholder="Lien Google Drive" class="attachment-url">
                                    <button class="remove-attachment" onclick="removeAttachmentField(this)">×</button>
                                </div>
                            </div>
                            
                            <button class="add-attachment-btn" onclick="addAttachmentField()">+ Ajouter une pièce jointe</button>
                        </div>

                        <div class="form-group">
                            <label for="courseTitle">Titre du cours</label>
                            <input type="text" id="courseTitle" placeholder="Ex: Introduction à JavaScript">
                        </div>
                        
                        <div class="form-group">
                            <label for="courseCategory">Catégorie</label>
                            <select id="courseCategory">
                                <option value="programmation">Programmation</option>
                                <option value="web">Développement Web</option>
                                <option value="database">Base de données</option>
                                <option value="algorithmes">Algorithmes</option>
                                <option value="reseaux">Réseaux</option>
                            </select>
                        </div>
                        
                        <div class="form-group">
                            <label for="courseDescription">Description</label>
                            <textarea id="courseDescription" rows="3" placeholder="Description du cours..."></textarea>
                        </div>
                        
                        <button class="upload-btn" onclick="addCourse()">Publier le cours</button>
                    </div>
                </div>

                <!-- Section Statistiques -->
                <div id="stats" class="content-section">
                    <div class="stats-grid">
                        <div class="stat-card">
                            <div class="stat-number" id="totalCourses">0</div>
                            <div class="stat-label">Cours publiés</div>
                        </div>
                        <div class="stat-card">
                            <div class="stat-number" id="totalViews">0</div>
                            <div class="stat-label">Vues totales</div>
                        </div>
                        <div class="stat-card">
                            <div class="stat-number" id="totalStudents">0</div>
                            <div class="stat-label">Étudiants</div>
                        </div>
                        <div class="stat-card">
                            <div class="stat-number" id="avgRating">4.8</div>
                            <div class="stat-label">Note moyenne</div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
        
        <!-- Modal pour visualiser les cours -->
        <div id="courseModal" class="modal">
            <div class="modal-content">
                <button class="close-btn" onclick="closeModal()">&times;</button>
                <div id="modalContent" style="display: flex; flex-direction: column; align-items: center; text-align: center;"></div>
            </div>
        </div>
    `;
}

// Initialisation
document.addEventListener('DOMContentLoaded', function() {
    // Gestion du routage basé sur le hash
    const hash = window.location.hash.substring(1);
    
    // Vérifier si on arrive via un lien de réinitialisation
    handlePasswordReset();
    
    // Gérer le routage initial
    if (hash === 'register') {
        currentPage = 'auth';
    } else if (hash === 'reset') {
        currentPage = 'reset';
    }
    
    // Initialiser l'application
    renderApp();
    
    // Observer l'état d'authentification
    auth.onAuthStateChanged(user => {
        if (user) {
            // Déterminer le rôle
            const role = user.email === ADMIN_EMAIL ? 'admin' : 'student';
            
            currentUser = {
                uid: user.uid,
                email: user.email,
                name: user.displayName || user.email.split('@')[0],
                role: role
            };
            navigateTo('main');
        } else {
            currentUser = null;
            if (courseListener) courseListener();
            navigateTo('auth');
        }
    });
});

// Fonction pour extraire l'ID d'un lien Google Drive
function extractDriveId(url) {
    // Format 1: https://drive.google.com/file/d/DRIVE_ID/view?usp=sharing
    const match1 = url.match(/\/file\/d\/([^\/]+)/);
    if (match1 && match1[1]) return match1[1];
    
    // Format 2: https://drive.google.com/open?id=DRIVE_ID
    const match2 = url.match(/[?&]id=([^&]+)/);
    if (match2 && match2[1]) return match2[1];
    
    // Format 3: DRIVE_ID seul
    if (url.length > 20 && url.length < 50) return url;
    
    return null;
}

// Ajouter un champ pour une nouvelle pièce jointe
function addAttachmentField() {
    const container = document.getElementById('attachmentsContainer');
    const div = document.createElement('div');
    div.className = 'attachment-input';
    div.innerHTML = `
        <input type="text" placeholder="Nom du fichier" class="attachment-name">
        <input type="text" placeholder="Lien Google Drive" class="attachment-url">
        <button class="remove-attachment" onclick="removeAttachmentField(this)">×</button>
    `;
    container.appendChild(div);
}

// Supprimer un champ de pièce jointe
function removeAttachmentField(button) {
    button.parentElement.remove();
}

// Récupérer les pièces jointes saisies
function getAttachments() {
    const attachments = [];
    const inputs = document.querySelectorAll('.attachment-input');
    
    inputs.forEach(input => {
        const name = input.querySelector('.attachment-name').value;
        const url = input.querySelector('.attachment-url').value;
        
        if (name && url) {
            const driveId = extractDriveId(url);
            if (driveId) {
                attachments.push({
                    name: name,
                    driveId: driveId,
                    directLink: `https://drive.google.com/uc?export=download&id=${driveId}`
                });
            } else {
                alert(`Le lien Google Drive est invalide pour "${name}". Veuillez vérifier le format.`);
            }
        }
    });
    
    return attachments;
}

// Fonction pour télécharger les pièces jointes
function downloadAttachment(directLink, filename) {
    const link = document.createElement('a');
    link.href = directLink;
    link.download = filename;
    link.target = '_blank';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
}

// Afficher une notification de succès
function showSuccessNotification(message) {
    const notification = document.createElement('div');
    notification.className = 'success-notification';
    notification.textContent = message;
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.remove();
    }, 3000);
}

// Charger les cours depuis Firestore
function loadCourses() {
    const courseGrid = document.getElementById('courseGrid');
    if (!courseGrid) return;
    
    courseGrid.innerHTML = '<div class="loading"><div class="spinner"></div></div>';
    
    // Détacher l'ancien écouteur s'il existe
    if (courseListener) courseListener();
    
    // Attacher un nouvel écouteur en temps réel
    courseListener = db.collection("courses").onSnapshot(snapshot => {
        courses = [];
        snapshot.forEach(doc => {
            const course = doc.data();
            course.id = doc.id;
            courses.push(course);
        });
        
        renderCourses();
        if (currentUser && currentUser.role === 'admin') {
            loadStatistics();
        }
    }, error => {
        console.error("Erreur de chargement des cours: ", error);
        if (courseGrid) {
            courseGrid.innerHTML = `
                <div class="no-courses">
                    <div class="no-courses-icon">❌</div>
                    <h3>Erreur de chargement des cours</h3>
                    <p>Veuillez réessayer plus tard</p>
                </div>
            `;
        }
    });
}

// Gestion de la réinitialisation de mot de passe
async function handlePasswordReset() {
    const urlParams = new URLSearchParams(window.location.search);
    const mode = urlParams.get('mode');
    const oobCode = urlParams.get('oobCode');
    
    if (mode === 'resetPassword' && oobCode) {
        try {
            const email = await auth.verifyPasswordResetCode(oobCode);
            
            // Ajouter l'email aux paramètres d'URL pour l'afficher
            const newUrl = new URL(window.location);
            newUrl.searchParams.set('email', email);
            window.history.replaceState({}, '', newUrl);
            
            navigateTo('new-password');
        } catch (error) {
            console.error("Code invalide ou expiré:", error);
            showAuthAlert("Le lien de réinitialisation est invalide ou a expiré.", 'error');
        }
    }
}

// Configuration des écouteurs pour la page d'authentification
function setupAuthListeners() {
    // Écouteurs pour les onglets
    document.getElementById('loginTab')?.addEventListener('click', () => switchAuthTab('login'));
    document.getElementById('registerTab')?.addEventListener('click', () => switchAuthTab('register'));
    
    // Écouteurs pour les formulaires
    document.getElementById('loginForm')?.addEventListener('submit', handleLogin);
    document.getElementById('registerForm')?.addEventListener('submit', handleRegister);
    
    // Vérifier le fragment initial
    const hash = window.location.hash.substring(1);
    if (hash === 'register') {
        switchAuthTab('register');
    }
}

// Configuration des écouteurs pour la réinitialisation
function setupResetListeners() {
    document.getElementById('sendResetBtn')?.addEventListener('click', sendPasswordResetEmail);
    document.getElementById('cancelResetBtn')?.addEventListener('click', closeResetPasswordModal);
}

// Configuration des écouteurs pour le nouveau mot de passe
function setupNewPasswordListeners() {
    document.getElementById('newPasswordForm')?.addEventListener('submit', handleNewPasswordSubmit);
}

// Configuration pour l'interface principale
function setupMainApp() {
    // Écouteur pour la touche Entrée dans la recherche
    document.getElementById('searchInput')?.addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
            searchCourses();
        }
    });
    
    // Mettre à jour les informations utilisateur
    if (currentUser) {
        document.getElementById('userName').textContent = currentUser.name;
        document.getElementById('userRole').textContent = 
            currentUser.role === 'admin' ? 'Professeur/Admin' : 'Étudiant';
        
        // Initiales pour l'avatar
        const initials = currentUser.name.split(' ').map(n => n[0]).join('').substring(0, 2);
        document.getElementById('userAvatar').textContent = initials;
        
        // Générer les onglets de navigation selon le rôle
        generateNavigationTabs();
    }
    
    // Charger les cours
    loadCourses();
}

// Basculer entre connexion et inscription
function switchAuthTab(tab) {
    document.querySelectorAll('.auth-tab').forEach(btn => btn.classList.remove('active'));
    document.querySelectorAll('.auth-form').forEach(form => form.classList.remove('active'));
    
    event.target.classList.add('active');
    document.getElementById(tab + 'Form').classList.add('active');
    clearAuthAlert();
}

// Afficher une alerte d'authentification
function showAuthAlert(message, type = 'error') {
    const alertDiv = document.getElementById('authAlert');
    if (alertDiv) {
        alertDiv.innerHTML = `<div class="alert alert-${type}">${message}</div>`;
        setTimeout(() => clearAuthAlert(), 5000);
    }
}

function clearAuthAlert() {
    const alertDiv = document.getElementById('authAlert');
    if (alertDiv) alertDiv.innerHTML = '';
}

// Connexion avec Firebase - CORRIGÉ
async function handleLogin(e) {
    e.preventDefault();
    const email = document.getElementById('loginEmail').value;
    const password = document.getElementById('loginPassword').value;
    const loginBtn = document.getElementById('loginBtn');

    loginBtn.disabled = true;
    loginBtn.textContent = 'Connexion...';

    try {
        const userCredential = await auth.signInWithEmailAndPassword(email, password);
        
        // Mettre à jour le profil utilisateur
        await userCredential.user.reload();
        
        // Vérifier si l'email est vérifié
        if (!userCredential.user.emailVerified) {
            await userCredential.user.sendEmailVerification();
            showAuthAlert("Un email de vérification a été envoyé. Veuillez vérifier votre boîte de réception.", 'info');
            return;
        }

        // Connexion réussie
        showAuthAlert("Connexion réussie! Redirection en cours...", 'success');
        setTimeout(() => {
            navigateTo('main');
        }, 1500);
        
    } catch (error) {
        loginBtn.disabled = false;
        loginBtn.textContent = 'Se connecter';
        showAuthAlert(getFirebaseErrorMessage(error));
    }
}

// Inscription avec Firebase - CORRIGÉ
async function handleRegister(e) {
    e.preventDefault();
    const name = document.getElementById('registerName').value;
    const email = document.getElementById('registerEmail').value;
    const password = document.getElementById('registerPassword').value;
    const registerBtn = document.getElementById('registerBtn');

    registerBtn.disabled = true;
    registerBtn.textContent = 'Création...';

    try {
        const userCredential = await auth.createUserWithEmailAndPassword(email, password);
        
        // Mettre à jour le profil utilisateur
        await userCredential.user.updateProfile({
            displayName: name
        });

        // Envoyer l'email de vérification
        await userCredential.user.sendEmailVerification();

        // Stocker l'utilisateur dans Firestore
        await db.collection('users').doc(userCredential.user.uid).set({
            name: name,
            email: email,
            createdAt: firebase.firestore.FieldValue.serverTimestamp(),
            emailVerified: false
        });

        // Afficher un message de succès
        showAuthAlert('Compte créé avec succès! Un email de vérification a été envoyé.', 'success');
        
    } catch (error) {
        showAuthAlert(getFirebaseErrorMessage(error));
    } finally {
        registerBtn.disabled = false;
        registerBtn.textContent = 'Créer un compte';
    }
}

// Traduire les erreurs Firebase
function getFirebaseErrorMessage(error) {
    switch(error.code) {
        case 'auth/email-already-in-use':
            return 'Cet email est déjà utilisé';
        case 'auth/invalid-email':
            return 'Email invalide';
        case 'auth/weak-password':
            return 'Le mot de passe doit contenir au moins 6 caractères';
        case 'auth/user-not-found':
            return 'Aucun compte trouvé avec cet email';
        case 'auth/wrong-password':
            return 'Mot de passe incorrect';
        default:
            return 'Une erreur est survenue. Veuillez réessayer.';
    }
}

// Générer les onglets de navigation
function generateNavigationTabs() {
    const navTabs = document.getElementById('navTabs');
    if (!navTabs || !currentUser) return;
    
    navTabs.innerHTML = '';
    
    const tabs = [
        { id: 'courses', label: '📚 Mes Cours', show: true },
        { id: 'upload', label: '📤 Upload', show: currentUser.role === 'admin' },
        { id: 'stats', label: '📊 Statistiques', show: currentUser.role === 'admin' }
    ];
    
    tabs.forEach(tab => {
        if (tab.show) {
            const button = document.createElement('button');
            button.className = 'tab-btn';
            button.textContent = tab.label;
            button.onclick = () => switchTab(tab.id);
            if (tab.id === 'courses') button.classList.add('active');
            navTabs.appendChild(button);
        }
    });
}

// Changer d'onglet
function switchTab(tabId) {
    // Désactiver tous les onglets
    document.querySelectorAll('.tab-btn').forEach(btn => {
        btn.classList.remove('active');
    });
    
    // Désactiver toutes les sections
    document.querySelectorAll('.content-section').forEach(section => {
        section.classList.remove('active');
    });
    
    // Activer l'onglet sélectionné
    const activeTab = Array.from(document.querySelectorAll('.tab-btn')).find(btn => 
        btn.textContent.includes(
            tabId === 'courses' ? 'Mes Cours' : 
            tabId === 'upload' ? 'Upload' : 'Statistiques'
        )
    );
    
    if (activeTab) {
        activeTab.classList.add('active');
    }
    
    // Activer la section correspondante
    const section = document.getElementById(tabId);
    if (section) {
        section.classList.add('active');
        
        // Recharger les données si nécessaire
        if (tabId === 'stats') {
            loadStatistics();
        } else if (tabId === 'upload') {
            resetUploadForm();
        }
    }
}

// Afficher les cours
function renderCourses() {
    const courseGrid = document.getElementById('courseGrid');
    if (!courseGrid) return;
    
    if (courses.length === 0) {
        courseGrid.innerHTML = `
            <div class="no-courses">
                <div class="no-courses-icon">📭</div>
                <h3>Aucun cours disponible</h3>
                <p>Commencez par ajouter du contenu si vous êtes administrateur</p>
            </div>
        `;
        return;
    }
    
    courseGrid.innerHTML = '';
    
    courses.forEach(course => {
        const card = document.createElement('div');
        card.className = 'course-card';
        
        const thumbnailContent = course.type === 'youtube' ? 
            `<img src="https://img.youtube.com/vi/${course.videoId}/0.jpg" alt="${course.title}" loading="lazy">
             <button class="play-btn" onclick="openCourseModal('${course.id}')">▶</button>` :
            course.fileType === 'pdf' ? 
            `<div class="pdf-icon">📄</div>` :
            `<div class="video-placeholder">▶️</div>
             <button class="play-btn" onclick="openCourseModal('${course.id}')">▶</button>`;
        
        card.innerHTML = `
            <div class="course-thumbnail" style="background: ${getCategoryColor(course.category)}">
                ${thumbnailContent}
                ${currentUser && currentUser.role === 'admin' ? `
                <div class="course-actions">
                    <button class="delete-btn" onclick="deleteCourse('${course.id}')">🗑️</button>
                </div>` : ''}
            </div>
            <div class="course-info">
                <div class="course-title">${course.title}</div>
                <p>${course.description}</p>
                <div class="course-meta">
                    <div>${course.type === 'youtube' ? '🎬 YouTube' : 
                          course.fileType === 'video' ? '🎬 ' + (course.duration || 'N/A') : 
                          '📄 ' + (course.pages || '0') + ' pages'}</div>
                    <div>👁️ ${course.views || 0} vues</div>
                </div>
                <div class="course-category">${getCategoryLabel(course.category)}</div>
            </div>
        `;
        
        if (course.type === 'drive' && course.fileType === 'pdf') {
            card.querySelector('.course-thumbnail').addEventListener('click', () => openCourseModal(course.id));
        }
        
        courseGrid.appendChild(card);
    });
}

// Gestion des catégories
function getCategoryLabel(category) {
    const categories = {
        programmation: 'Programmation',
        web: 'Développement Web',
        database: 'Base de données',
        algorithmes: 'Algorithmes',
        reseaux: 'Réseaux'
    };
    return categories[category] || category;
}

function getCategoryColor(category) {
    const colors = {
        programmation: 'linear-gradient(45deg, #667eea, #764ba2)',
        web: 'linear-gradient(45deg, #43e97b, #38f9d7)',
        database: 'linear-gradient(45deg, #fa709a, #fee140)',
        algorithmes: 'linear-gradient(45deg, #4facfe, #00f2fe)',
        reseaux: 'linear-gradient(45deg, #a6c0fe, #f68084)'
    };
    return colors[category] || 'linear-gradient(45deg, #667eea, #764ba2)';
}

// Basculer entre les champs YouTube et Google Drive
function toggleUploadFields() {
    const contentType = document.getElementById('contentType').value;
    document.getElementById('youtubeFields').style.display = contentType === 'youtube' ? 'block' : 'none';
    document.getElementById('driveFields').style.display = contentType === 'drive' ? 'block' : 'none';
}

// Ajouter un nouveau cours
async function addCourse() {
    const title = document.getElementById('courseTitle').value;
    const category = document.getElementById('courseCategory').value;
    const description = document.getElementById('courseDescription').value;
    const contentType = document.getElementById('contentType').value;
    
    if (!title) {
        alert('Veuillez ajouter un titre');
        return;
    }

    const newCourse = {
        title,
        category,
        description,
        views: 0,
        author: currentUser.name,
        createdAt: firebase.firestore.FieldValue.serverTimestamp(),
        attachments: getAttachments()
    };

    if (contentType === 'youtube') {
        const youtubeUrl = document.getElementById('youtubeUrl').value;
        if (!youtubeUrl) {
            alert('Veuillez entrer une URL YouTube');
            return;
        }
        
        // Extraire l'ID de la vidéo YouTube
        const videoId = extractYouTubeId(youtubeUrl);
        if (!videoId) {
            alert('URL YouTube invalide');
            return;
        }
        
        newCourse.type = 'youtube';
        newCourse.videoId = videoId;
        newCourse.duration = "N/A";
    } else {
        const driveUrl = document.getElementById('driveUrl').value;
        if (!driveUrl) {
            alert('Veuillez entrer un lien Google Drive');
            return;
        }
        
        const fileType = document.getElementById('fileType').value;
        const driveId = extractDriveId(driveUrl);
        if (!driveId) {
            alert('Lien Google Drive invalide');
            return;
        }
        
        newCourse.type = 'drive';
        newCourse.fileType = fileType;
        newCourse.driveId = driveId;
        newCourse.directLink = `https://drive.google.com/uc?export=download&id=${driveId}`;
        
        if (fileType === 'video') {
            newCourse.duration = "N/A";
        } else {
            newCourse.pages = 0;
        }
    }

    try {
        // Ajouter le cours à Firestore
        await db.collection("courses").add(newCourse);
        
        // Afficher une notification de succès
        showSuccessNotification('Cours ajouté avec succès !');
        
        // Réinitialiser le formulaire
        resetUploadForm();
    } catch (error) {
        console.error("Erreur lors de l'ajout du cours: ", error);
        alert("Une erreur est survenue lors de l'ajout du cours");
    }
}

// Extraire l'ID d'une URL YouTube
function extractYouTubeId(url) {
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
    const match = url.match(regExp);
    return (match && match[2].length === 11) ? match[2] : null;
}

// Réinitialiser le formulaire d'upload
function resetUploadForm() {
    document.getElementById('courseTitle').value = '';
    document.getElementById('courseDescription').value = '';
    document.getElementById('youtubeUrl').value = '';
    document.getElementById('driveUrl').value = '';
    
    // Réinitialiser les champs Google Drive
    const container = document.getElementById('attachmentsContainer');
    if (container) {
        container.innerHTML = `
            <div class="attachment-input">
                <input type="text" placeholder="Nom du fichier" class="attachment-name">
                <input type="text" placeholder="Lien Google Drive" class="attachment-url">
                <button class="remove-attachment" onclick="removeAttachmentField(this)">×</button>
            </div>
        `;
    }
}

// Charger les statistiques
function loadStatistics() {
    document.getElementById('totalCourses').textContent = courses.length;
    document.getElementById('totalViews').textContent = courses.reduce((sum, course) => sum + (course.views || 0), 0);
    document.getElementById('totalStudents').textContent = "42"; // Valeur simulée
}

// Recherche de cours
function searchCourses() {
    const searchTerm = document.getElementById('searchInput').value.toLowerCase();
    const courseGrid = document.getElementById('courseGrid');
    if (!courseGrid) return;
    
    if (!searchTerm) {
        renderCourses();
        return;
    }
    
    const filteredCourses = courses.filter(course => 
        course.title.toLowerCase().includes(searchTerm) || 
        course.description.toLowerCase().includes(searchTerm) ||
        course.category.toLowerCase().includes(searchTerm)
    );
    
    if (filteredCourses.length === 0) {
        courseGrid.innerHTML = `
            <div class="no-courses">
                <div class="no-courses-icon">🔍</div>
                <h3>Aucun résultat trouvé</h3>
                <p>Essayez avec d'autres termes de recherche</p>
            </div>
        `;
        return;
    }
    
    courseGrid.innerHTML = '';
    filteredCourses.forEach(course => {
        const card = document.createElement('div');
        card.className = 'course-card';
        
        const thumbnailContent = course.type === 'youtube' ? 
            `<img src="https://img.youtube.com/vi/${course.videoId}/0.jpg" alt="${course.title}" loading="lazy">
             <button class="play-btn" onclick="openCourseModal('${course.id}')">▶</button>` :
            course.fileType === 'pdf' ? 
            `<div class="pdf-icon">📄</div>` :
            `<div class="video-placeholder">▶️</div>
             <button class="play-btn" onclick="openCourseModal('${course.id}')">▶</button>`;
        
        card.innerHTML = `
            <div class="course-thumbnail" style="background: ${getCategoryColor(course.category)}">
                ${thumbnailContent}
                ${currentUser && currentUser.role === 'admin' ? `
                <div class="course-actions">
                    <button class="delete-btn" onclick="deleteCourse('${course.id}')">🗑️</button>
                </div>` : ''}
            </div>
            <div class="course-info">
                <div class="course-title">${course.title}</div>
                <p>${course.description}</p>
                <div class="course-meta">
                    <div>${course.type === 'youtube' ? '🎬 YouTube' : 
                          course.fileType === 'video' ? '🎬 ' + (course.duration || 'N/A') : 
                          '📄 ' + (course.pages || '0') + ' pages'}</div>
                    <div>👁️ ${course.views || 0} vues</div>
                </div>
                <div class="course-category">${getCategoryLabel(course.category)}</div>
            </div>
        `;
        
        if (course.type === 'drive' && course.fileType === 'pdf') {
            card.querySelector('.course-thumbnail').addEventListener('click', () => openCourseModal(course.id));
        }
        
        courseGrid.appendChild(card);
    });
}

// Supprimer un cours
async function deleteCourse(courseId) {
    if (confirm('Êtes-vous sûr de vouloir supprimer ce cours ?')) {
        try {
            await db.collection("courses").doc(courseId).delete();
            showSuccessNotification('Cours supprimé avec succès !');
        } catch (error) {
            console.error("Erreur lors de la suppression du cours: ", error);
            alert("Une erreur est survenue lors de la suppression du cours");
        }
    }
}

// Déconnexion
function logout() {
    auth.signOut().then(() => {
        // Redirection immédiate
        window.location.href = "index.html";
    }).catch(error => {
        alert('Erreur lors de la déconnexion: ' + error.message);
    });
}

function openCourseModal(courseId) {
    const course = courses.find(c => c.id === courseId);
    const modalContent = document.getElementById('modalContent');
    if (!modalContent) return;
    
    // Fermer toute vidéo en cours
    if (currentVideoIframe) {
        currentVideoIframe.remove();
        currentVideoIframe = null;
    }

    let contentHtml = `
        <h2 style="margin-bottom: 20px; color: #333;">${course.title}</h2>
        <p style="margin-bottom: 15px; color: #666;">${course.description}</p>
        <div class="video-player-container">
    `;

    if (course.type === 'youtube') {
        contentHtml += `
            <div class="play-btn-overlay" id="playButton">
                <span style="font-size: 24px;">▶</span>
            </div>
        `;
    } else {
        contentHtml += `
            <div style="display:flex;justify-content:center;align-items:center;height:100%;color:white;font-size:24px;">
                ${course.fileType === 'pdf' ? '📄 Prévisualisation du PDF' : '▶️ Lecture de la vidéo'}
            </div>
        `;
    }

    contentHtml += `</div>`;

    // Ajouter les pièces jointes
    contentHtml += renderAttachments(course);

    modalContent.innerHTML = contentHtml;

    // Gestion du clic sur le bouton play
    if (course.type === 'youtube') {
        document.getElementById('playButton').addEventListener('click', function() {
            this.remove();
            const iframe = document.createElement('iframe');
            iframe.id = 'videoPlayer';
            iframe.src = `https://www.youtube.com/embed/${course.videoId}?rel=0&modestbranding=1`;
            iframe.setAttribute('frameborder', '0');
            iframe.setAttribute('allowfullscreen', '');
            iframe.setAttribute('allow', 'accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture');
            document.querySelector('.video-player-container').appendChild(iframe);
            currentVideoIframe = iframe;
            
            // Mettre à jour le compteur de vues dans Firestore
            updateCourseViews(course.id, course.views);
        });
    }

    document.getElementById('courseModal').style.display = 'block';
}

// Mettre à jour le compteur de vues dans Firestore
function updateCourseViews(courseId, currentViews) {
    const newViews = currentViews + 1;
    db.collection("courses").doc(courseId).update({
        views: newViews
    }).then(() => {
        // Mettre à jour localement pour éviter un rechargement complet
        const course = courses.find(c => c.id === courseId);
        if (course) {
            course.views = newViews;
        }
    }).catch(error => {
        console.error("Erreur lors de la mise à jour des vues: ", error);
    });
}

function closeModal() {
    if (currentVideoIframe) {
        currentVideoIframe.remove();
        currentVideoIframe = null;
    }
    document.getElementById('courseModal').style.display = 'none';
}

function renderAttachments(course) {
    if (!course.attachments || course.attachments.length === 0) return '';
    
    let html = `
        <div class="attachments-section">
            <h3>Documents du cours</h3>
            <ul class="attachment-list">
    `;

    course.attachments.forEach(file => {
        html += `
            <li class="attachment-item">
                <a href="#" class="attachment-link" 
                   onclick="downloadAttachment('${file.directLink}', '${file.name}')">
                    ${file.name}
                    <span class="download-icon">⬇️</span>
                </a>
            </li>
        `;
    });

    html += `
            </ul>
        </div>
    `;

    return html;
}

// Fonctions pour la réinitialisation du mot de passe
function showResetPasswordModal() {
    const email = document.getElementById('loginEmail')?.value || '';
    navigateTo('reset');
    
    // Pré-remplir l'email si disponible
    setTimeout(() => {
        const resetEmail = document.getElementById('resetEmail');
        if (resetEmail) resetEmail.value = email;
    }, 100);
}

function closeResetPasswordModal() {
    navigateTo('auth');
}

async function sendPasswordResetEmail() {
    const email = document.getElementById('resetEmail').value;
    if (!email) {
        alert("Veuillez entrer votre email");
        return;
    }
    try {
        await firebase.auth().sendPasswordResetEmail(email, {
            // URL de redirection personnalisée
            url: window.location.href.split('#')[0] + 'reset_password.html',
            handleCodeInApp: true
        });
        alert(`Email envoyé à ${email}. Vérifiez votre boîte de réception.`);
    } catch (error) {
        console.error("Erreur:", error);
        let message = "Une erreur est survenue";
        if (error.code === "auth/user-not-found") {
            message = "Aucun compte associé à cet email";
        } else if (error.code === "auth/invalid-email") {
            message = "Adresse email invalide";
        }
        alert(`Erreur: ${message}`);
    }
}

async function handleNewPasswordSubmit(e) {
    e.preventDefault();
    const newPassword = document.getElementById('newPassword').value;
    const confirmPassword = document.getElementById('confirmPassword').value;
    
    // Vérifications
    if (!newPassword || newPassword.length < 6) {
        showAuthAlert("Le mot de passe doit contenir au moins 6 caractères", 'error');
        return;
    }
    
    if (newPassword !== confirmPassword) {
        showAuthAlert("Les mots de passe ne correspondent pas", 'error');
        return;
    }
    
    try {
        const urlParams = new URLSearchParams(window.location.search);
        const oobCode = urlParams.get('oobCode');
        
        if (!oobCode) {
            showAuthAlert("Code de réinitialisation manquant", 'error');
            return;
        }
        
        // Confirmer la réinitialisation avec le nouveau mot de passe
        await auth.confirmPasswordReset(oobCode, newPassword);
        
        showAuthAlert("Mot de passe changé avec succès ! Vous pouvez maintenant vous connecter.", 'success');
        
        // Rediriger vers la page de connexion
        setTimeout(() => {
            window.location.href = window.location.href.split('?')[0] + '#login';
            navigateTo('auth');
        }, 3000);
        
    } catch (error) {
        console.error("Erreur lors du changement:", error);
        let message = "Erreur lors du changement de mot de passe";
        
        if (error.code === "auth/expired-action-code") {
            message = "Le lien a expiré. Demandez un nouveau lien de réinitialisation.";
        } else if (error.code === "auth/invalid-action-code") {
            message = "Le lien est invalide.";
        } else if (error.code === "auth/weak-password") {
            message = "Le mot de passe est trop faible.";
        }
        
        showAuthAlert(message, 'error');
    }
}