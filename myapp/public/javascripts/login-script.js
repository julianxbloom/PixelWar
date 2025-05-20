import FingerprintJS from '@fingerprintjs/fingerprintjs';

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

    // Initialisation de l'agent
    const fpPromise = FingerprintJS.load();

    // Obtenir l'identifiant du visiteur
    fpPromise
    .then(fp => fp.get())
    .then(result => {
        // Cela contient l'identifiant unique du visiteur :
        const visitorId = result.visitorId;
        console.log(visitorId);
    })
    .catch(error => {
        console.error('Erreur lors du chargement de FingerprintJS :', error);
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