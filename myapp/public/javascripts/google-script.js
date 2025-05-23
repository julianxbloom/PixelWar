function onGoogleSignIn(response) {
    // Le token JWT envoyé par Google
    const id_token = response.credential;

    // Envoie le token à ton serveur pour vérification
    fetch('/google', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id_token })
    })
    .then(res => res.json())
    .then(data => {
        if(data.success) {
            // Appliquer l'animation
            window.location.href = '/login';
        } else {
            alert('Erreur de connexion Google');
        }
    });
}

window.onload = function() {
    google.accounts.id.initialize({
        client_id: "435477578567-5pnm940jdum7dusda7e4vkdh495g08ls.apps.googleusercontent.com",
        callback: onGoogleSignIn
    });

    document.getElementById('googleBtn').onclick = function() {
        console.log("Google button clicked");
        google.accounts.id.prompt(); // Ouvre la popup Google
    };
};
