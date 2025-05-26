const images = [
    '/images/bgGridTel.png',
    '/images/bgGridTel.png',
    '/images/bgGridTel.png',
    '/images/bgGridTel.png',
    '/images/bgGridTel.png',
    '/images/bgGridTel.png'
];

let currentIndex = 0;

const imgElem = document.getElementById('tutoImg');
const nextBtn = document.getElementById('nextBtn');

nextBtn.addEventListener('click', () => {
    currentIndex++;
    if (currentIndex >= images.length) {
    // Le tuto est fini, on masque le tuto et on affiche le formulaire
    alert("Tuto terminé !");
    } else {
    // Change l'image du tuto
    imgElem.src = images[currentIndex];
    }
});