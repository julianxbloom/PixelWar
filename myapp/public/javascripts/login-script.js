document.getElementById("loginButton").onclick = onLoginButtonClick();

function onLoginButtonClick() {
    const pseudo = document.getElementById('pseudo').value;
    const CurrentClass = document.getElementById('CurrentClass').value;
}

function onGoogleSignIn(response) {
    // Le token JWT envoyé par Google
    const id_token = response.credential;
    // Envoie le token à ton serveur pour vérification
    fetch('/login/google', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id_token })
    })
    .then(res => res.json())
    .then(data => {
        if(data.success) {
            window.location.href = '/';
        } else {
            alert('Erreur de connexion Google');
        }
    });
}