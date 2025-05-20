document.getElementById("loginButton").onclick = onLoginButtonClick();

function onLoginButtonClick() {
    const pseudo = document.getElementById('pseudo').value;
    const CurrentClass = document.getElementById('CurrentClass').value;
    console.log(pseudo);
    console.log(CurrentClass);

    console.log(window.navigator.hardwareConcurrency);
    console.log(window.navigator.userAgent);
    console.log(window.navigator.languages);
    console.log(window.navigator.maxTouchPoints);
    console.log(window.navigator.deviceMemory);
    console.log(window.screen.width);
    console.log(window.screen.height);
    console.log(window.screen.colorDepth);
    console.log(window.screen.orientation.type);
    console.log(window.screen.availWidth);
    console.log(window.screen.availHeight);

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
/*<script src="https://apis.google.com/js/platform.js" async defer></script>

<div class="g-signin2" data-onsuccess="onSignIn"></div>

<script>
  function onSignIn(googleUser) {
    var profile = googleUser.getBasicProfile();
    var userId = profile.getId();
    var userName = profile.getName();
    alert('ID: ' + userId);
    alert('Name: ' + userName);
  }
</script>*/