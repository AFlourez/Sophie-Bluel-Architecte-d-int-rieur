document.addEventListener('DOMContentLoaded', () => {
    const loginForm = document.getElementById('loginForm');
    const usernameInput = document.getElementById('uname');
    const passwordInput = document.getElementById('psw');
    const apiUrl = "http://localhost:5678/api";

    loginForm.addEventListener('submit', function(event) {
        event.preventDefault();  // Empêche l'envoi du formulaire

        const apiUrl = "http://localhost:5678/api";

        const body = {
            email: usernameInput.value,
            password: passwordInput.value
        };
        
        console.log(body);
        
        fetch(apiUrl + '/users/login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(body)
        })
        .then(response => response.json())
        .then(data => {
            console.log(data);
            if (data.token) {
                sessionStorage.setItem('loggedIn', 'true');
                sessionStorage.setItem('token', data.token);
                window.location.href = 'index.html';
            } else {
                alert('Erreur dans l\’identifiant ou le mot de passe.');
            }
        })
        .catch(error => console.error('Error:', error))
    });
});
