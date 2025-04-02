document.addEventListener('DOMContentLoaded', () => {
    const pixelGrid = document.getElementById('pixel-grid');
    //const colorPicker = document.getElementById('color-picker');
    const zoomInBtn = document.getElementById('zoom-in');
    const zoomOutBtn = document.getElementById('zoom-out');

    const colorGrid = document.getElementById('color-grid');

    const gridSize = 100; // Taille de la grille (50x50 pixels)
    let zoomLevel = 1; // Niveau de zoom initial (1 = taille normale)
    const zoomFactor = 0.2; // Facteur de zoom
    const mooveFactorY = (gridSize * 8);
    const mooveFactorX = (gridSize * 2);
    const mooveFactorY = (gridSize * 9);
    const mooveFactorX = (gridSize * 8);


    let StartX = 0;
    let StartY = 0;
    let TransX = 0;
    let TransY = 0;
    let CurrentX = 0;
    let CurrentY = 0;
    let Drag = false;

    let Color = "#fff"
    let LColors = ["#FFFFFF", "#C0C0C0", "#808080", "#000000", "#FF0000", "#800000", "#FFFF00", "#808000", "#00FF00", "#008000", "#00FFFF", "#008080", "#0000FF", "#000080", "#FF00FF", "#800080"];

    // Fonction pour créer la grille de pixels
    function createPixelGrid() {
        pixelGrid.innerHTML = '';
        for (let i = 0; i < gridSize * gridSize; i++) {
            const pixel = document.createElement('div');
            //pixel.innerHTML += 
            pixel.classList.add('pixel');
            pixel.addEventListener('click', () => {
                pixel.style.backgroundColor = Color;
            });
            pixelGrid.appendChild(pixel);
        }
        
    }

    // Fonction pour créer la grille de pixels
    function createColorGrid() {
        colorGrid.innerHTML = '';
        for (let i = 0; i < 8 * 2; i++) {
            const color = document.createElement('div');
            //pixel.innerHTML += 
            color.classList.add('color');
            color.style.background = LColors[i]
            color.addEventListener('click', () => {
                Color = color.style.backgroundColor;
            });
            colorGrid.appendChild(color);
        }
    }

    // Fonction de zoom avant
    zoomInBtn.addEventListener('click', () => {
        if (zoomLevel < 2) { // Limite de zoom à 2x
            zoomLevel += zoomFactor;
            updateZoom();
        }
    });

    // Fonction de zoom arrière
    zoomOutBtn.addEventListener('click', () => {
        if (zoomLevel > 1) { // Limite de zoom à 0.4x
            zoomLevel -= zoomFactor;
            updateZoom();
        }
    });

    // Appliquer l'échelle de zoom à la grille
    function updateZoom() {
        pixelGrid.style.transform = `scale(${zoomLevel}) translateX(${0}px) translateY(${0}px)`;
        TransX = 0;
        CurrentX = 0;
        TransY = 0;
        CurrentY = 0;
    };

    function updatePos(X,Y){
        pixelGrid.style.transform = `scale(${zoomLevel}) translateX(${X}px) translateY(${Y}px)`; 
    }

    pixelGrid.addEventListener('mousedown', (e) => {
        Drag = true;
        StartX = e.clientX;
        StartY = e.clientY;
    });

    pixelGrid.addEventListener('mouseup', (e) => {
        Drag = false;
        CurrentX = TransX;
        CurrentY = TransY;
    });

    document.addEventListener('mousemove',(e) =>{   

        BetweenX = CurrentX + (e.clientX - StartX)*(1/zoomLevel);
        BetweenY = CurrentY + (e.clientY - StartY)*(1/zoomLevel);
        BetweenX = CurrentX + (e.clientX - StartX)/zoomLevel;
        BetweenY = CurrentY + (e.clientY - StartY)/zoomLevel;

        if(Drag && BetweenY > mooveFactorY && BetweenY <- mooveFactorY){
        if(Drag && Math.abs(BetweenY) < mooveFactorY-window.innerHeight/(zoomLevel*2)+20 ){
            // See if can moove without leaving the screen
            TransY = BetweenY
        }

        if (Drag && BetweenX < mooveFactorX*zoomLevel*2 ){//&& BetweenX > -mooveFactorX*(zoomLevel)) {
        if (Drag && Math.abs(BetweenX) < mooveFactorX-window.innerWidth/(zoomLevel*2)+50 ){
            // See if can moove without leaving the screen
            
            TransX = BetweenX           
        }


        updatePos(TransX,TransY); // Appliquer la translation


    });


    // Créer la grille au chargement de la page
    createPixelGrid();
    createColorGrid();
});


//pixelGrid.children[5]style.background = "F00000"
