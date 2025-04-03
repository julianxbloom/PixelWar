document.addEventListener('DOMContentLoaded', () => {

    const Class = document.getElementById('class-select');
    const Pseudo = document.getElementById('pseudo');
    const NextPage = document.getElementById('NextPage');



    // Fonction de zoom avant
    NextPage.addEventListener('click', () => {
        CurrentClass = Class.options[Class.selectedIndex].text;
        CurrentPseudo = Pseudo.value + CurrentClass;
        localStorage.setItem('name', CurrentPseudo);
        window.location.href='grid.html';
        
    });



});