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