document.addEventListener('DOMContentLoaded', () => {
    const loginForm = document.getElementById('loginForm');
    const usernameInput = document.getElementById('uname');
    const passwordInput = document.getElementById('psw');

    loginForm.addEventListener('submit', function(event) {
        event.preventDefault();  // Empêche l'envoi du formulaire

        const username = usernameInput.value;
        const password = passwordInput.value;

        if (username === 'admin' && password === 'admin') {
            console.log('Connexion réussie !');
            // Enregistre l'état de connexion dans le localStorage
            localStorage.setItem('loggedIn', 'true');
            // Redirection vers la page d'accueil
            window.location.href = 'index.html';
        } else {
            alert('Erreur dans l\'identifiant ou le mot de passe');
        }
    });
});
