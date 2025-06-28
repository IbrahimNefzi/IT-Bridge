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

// Charger le contenu d'authentification
function loadAuthContent() {
    const authContent = `
        <div class="auth-container">
            <div class="auth-card">
                <button class="close-auth-btn" onclick="document.getElementById('authModal').style.display='none'">&times;</button>
                <div class="auth-logo">🔒</div>
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
    
    document.getElementById('authModalContent').innerHTML = authContent;
    setupAuthListeners();
}

// Configuration des écouteurs d'authentification
function setupAuthListeners() {
    // Écouteurs pour les onglets
    document.getElementById('loginTab')?.addEventListener('click', () => switchAuthTab('login'));
    document.getElementById('registerTab')?.addEventListener('click', () => switchAuthTab('register'));
    
    // Écouteurs pour les formulaires
    document.getElementById('loginForm')?.addEventListener('submit', handleLogin);
    document.getElementById('registerForm')?.addEventListener('submit', handleRegister);
}

function switchAuthTab(tab) {
    document.querySelectorAll('.auth-tab').forEach(btn => btn.classList.remove('active'));
    document.querySelectorAll('.auth-form').forEach(form => form.classList.remove('active'));
    
    event.target.classList.add('active');
    document.getElementById(tab + 'Form').classList.add('active');
    clearAuthAlert();
}

function clearAuthAlert() {
    const alertDiv = document.getElementById('authAlert');
    if (alertDiv) alertDiv.innerHTML = '';
}

// Connexion avec Firebase
async function handleLogin(e) {
    e.preventDefault();
    const email = document.getElementById('loginEmail').value;
    const password = document.getElementById('loginPassword').value;
    const loginBtn = document.getElementById('loginBtn');

    loginBtn.disabled = true;
    loginBtn.textContent = 'Connexion...';

    try {
        const userCredential = await auth.signInWithEmailAndPassword(email, password);
        
        // Vérifier si l'email est vérifié
        if (!userCredential.user.emailVerified) {
            await userCredential.user.sendEmailVerification();
            showAuthAlert("Un email de vérification a été envoyé. Veuillez vérifier votre boîte de réception.", 'info');
            return;
        }

        // Rediriger vers l'application après connexion
        window.location.href = "app.html";
        
    } catch (error) {
        loginBtn.disabled = false;
        loginBtn.textContent = 'Se connecter';
        showAuthAlert(getFirebaseErrorMessage(error));
    }
}
// Inscription avec Firebase
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
        
        // Envoyer l'email de vérification
        await userCredential.user.sendEmailVerification();
        
        // Mettre à jour le profil utilisateur
        await userCredential.user.updateProfile({ displayName: name });
        
        // Stocker l'utilisateur dans Firestore
        await db.collection('users').doc(userCredential.user.uid).set({
            name: name,
            email: email,
            createdAt: firebase.firestore.FieldValue.serverTimestamp(),
            emailVerified: false
        });

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
        case 'auth/email-already-in-use': return 'Cet email est déjà utilisé';
        case 'auth/invalid-email': return 'Email invalide';
        case 'auth/weak-password': return 'Le mot de passe doit contenir au moins 6 caractères';
        case 'auth/user-not-found': return 'Aucun compte trouvé avec cet email';
        case 'auth/wrong-password': return 'Mot de passe incorrect';
        default: return 'Une erreur est survenue. Veuillez réessayer.';
    }
}

function showAuthAlert(message, type = 'error') {
    const alertDiv = document.getElementById('authAlert');
    if (alertDiv) {
        alertDiv.innerHTML = `<div class="alert alert-${type}">${message}</div>`;
    }
}