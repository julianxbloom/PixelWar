var link = document.createElement("link");
link.type = 'text/css';
link.rel = 'stylesheet';

if (screen.width > 600)
{
    document.head.appendChild(link);
    link.href = 'stylesheets/styles.css';
}
else {
    document.head.appendChild(link);
    link.href = 'stylesheets/stylestel.css';
}

document.addEventListener('DOMContentLoaded', () => {
    const pixelGrid = document.getElementById('pixel-grid');
    const zoomInBtn = document.getElementById('zoom-in');
    const zoomOutBtn = document.getElementById('zoom-out');
    const colorGrid = document.getElementById('color-grid');
    const fileimage = document.getElementById('fileimage');
    const imagePreview = document.getElementById('imagePreview');
    const mode = document.getElementById('changeControl');

    const gridSize = 100; // Taille de la grille (50x50 pixels)
    let zoomLevel = 3; // Niveau de zoom initial (1 = taille normale)
    const zoomFactor = 0.2; // Facteur de zoom    

    let StartX = 0;
    let StartY = 0;
    let TransX = 0;
    let TransY = 0;
    let CurrentX = 0;
    let CurrentY = 0;
    let drag = false;
    
    let imgOffsetX = 0;
    let imgOffsetY = 0;
    let dragImg = true;

    let Color = "#fff"
    let LColors = ["#FFFFFF", "#C0C0C0", "#808080", "#000000", "#FF0000", "#800000", "#FFFF00", "#808000", "#00FF00", "#008000", "#00FFFF", "#008080", "#0000FF", "#000080", "#FF00FF", "#800080"];

    let drawing = true;

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
        pixelGrid.children[100*99].style.backgroundColor = "#808000";
    }

    // Fonction pour créer la grille de couleur
    function createColorGrid() {
        colorGrid.innerHTML = '';
        for (let i = 0; i < 8 * 2; i++) {
            const color = document.createElement('div');
            //pixel.innerHTML += 
            color.classList.add('color');
            color.style.background = LColors[i]

            if (i == 0){
                ChooseColor = color;
                ChooseColor.style.border = "0.7vh solid black";
            }
            color.addEventListener('click', () => {
                // Set the border style
                ChooseColor.style.border = "0vh solid black";
                ChooseColor = color;
                ChooseColor.style.border = "0.7vh solid black";
                Color = color.style.backgroundColor;
            });
            colorGrid.appendChild(color);
        }
    }

    fileimage.addEventListener('change', function(event){

        const ImageEle = event.target.files[0];
        if (ImageEle && ImageEle.type.startsWith('image/')){

            const imgUrl = URL.createObjectURL(ImageEle);// crée l'url
            console.log('nice');
            imagePreview.src = imgUrl;
            imagePreview.alt = "Image chargée avec succès";// sert a r
            imagePreview.style.transform = `scale(${zoomLevel}) translateX(${0}px) translateY(${0}px)`;
        }
        else{
            imagePreview.alt = "Fail to load image";
        }
    });
    // Fonction de zoom avant
    zoomInBtn.addEventListener('click', () => {
        if (zoomLevel < 4) { // Limite de zoom à 2x
            zoomLevel += zoomFactor;
            updateZoom();
        }
    });

    // Fonction de zoom arrière
    zoomOutBtn.addEventListener('click', () => {
        if (zoomLevel > 1.4) { // Limite de zoom à 0.4x
            zoomLevel -= zoomFactor;
            updateZoom();
        }
    });

    // Fonction pour passer du mode dessin à celui ou on bouge la file
    mode.addEventListener('click',()=>{
        if (drawing){
            //Mettre les couleurs en gris
            mode.textContent = 'File'
        }
        else {
            //enlever le gris des couleurs
            mode.textContent = 'Drawing'
        }
        drawing = !drawing;
    })

    // Appliquer l'échelle de zoom à la grille
    function updateZoom() {

        /*TransX = Math.max(Math.min(TransX,mooveFactorX/zoomLevel*2),-mooveFactorX/zoomLevel*2);
        TransY = Math.max(Math.min(TransY,mooveFactorY/zoomLevel*2),-mooveFactorY/zoomLevel*2);*/

        if (drawing){
            pixelGrid.style.transform = `scale(${zoomLevel}) translateX(${TransX}px) translateY(${TransY}px)`;
        }
        else{
            imagePreview.style.transform = `scale(${zoomLevel}) translateX(${TransX}px) translateY(${TransY}px)`;
        }
        
        /*TransX = 0;
        CurrentX = 0;
        TransY = 0;
        CurrentY = 0;*/
    };

    function updatePos(X,Y){
        if (drawing){
            pixelGrid.style.transform = `scale(${zoomLevel}) translateX(${X}px) translateY(${Y}px)`; 
        }
        else{
            imagePreview.style.transform = `scale(${zoomLevel}) translateX(${X}px) translateY(${Y}px)`; 
        }
    }

    /*Pour les pc*/
    pixelGrid.addEventListener('mousedown', (e) => {
        zoomInBtn.style.backgroundColor = "red";
        mooveGridBegin(e);
    });

    document.addEventListener('mouseup', (e) => {
        zoomInBtn.style.backgroundColor = "green";
        mooveGridEnd(e);
        /*alert(pixelGrid.children[99].getBoundingClientRect().right);*/
    });

    document.addEventListener('mousemove',(e) =>{ 
        zoomInBtn.style.backgroundColor = "yellow";
        moovePixelGrid(e);
    });

    /*Pour les tels*/
    pixelGrid.addEventListener('touchstart', (e) => {
        
        if (e.touches.length === 2) {  // 
            // Deux doigts 
            const dx = e.touches[0].clientX - e.touches[1].clientX;
            const dy = e.touches[0].clientY - e.touches[1].clientY;
            initDistance = Math.hypot(dx, dy);
            initialZoom = zoomLevel;

        } else if (e.touches.length === 1) {  // 1 doigt
            zoomInBtn.style.backgroundColor = "red";
            mooveGridBegin(e.touches[0]);
        }

    },{passive : false});

    document.addEventListener('touchend', (e) => {
        zoomInBtn.style.backgroundColor = "green";
        mooveGridEnd(e.changedTouches[0]);
        //alert(pixelGrid.children[49].getBoundingClientRect().right + pixelGrid.children[49].getBoundingClientRect().width*50/zoomLevel);
    });

    document.addEventListener('touchmove', (e) => {

        if (e.touches.length === 2){
            e.preventDefault(); // bloquer le scroll tactile
            const dx = e.touches[0].clientX - e.touches[1].clientX;
            const dy = e.touches[0].clientY - e.touches[1].clientY;
            newDistance = Math.hypot(dx, dy);
            rapportDistance = newDistance/initDistance;
            zoomLevel = initialZoom*rapportDistance;  
            updateZoom();
        }

        else{
            e.preventDefault(); // bloquer le scroll tactile
            zoomInBtn.style.backgroundColor = "yellow";
            moovePixelGrid(e.touches[0]);    
        }
        


    },{passive: false });


    function mooveGridBegin(e){
        drag = true;
        StartX = e.clientX;
        StartY = e.clientY;
    }
    function mooveGridEnd(e){
        drag = false;
        dragImg = false;
        CurrentX = TransX;
        CurrentY = TransY;     
    }
        
    function moovePixelGrid (e){

        if(drag){
            BetweenY = CurrentY + (e.clientY - StartY)/zoomLevel
            BetweenX = CurrentX + (e.clientX - StartX)/zoomLevel;

            if (pixelGrid.children[0].getBoundingClientRect().top > 100){
                TransY = Math.min(TransY,BetweenY);
            }
            else if (pixelGrid.children[gridSize*(gridSize-1)].getBoundingClientRect().bottom < window.innerHeight -200){
                TransY = Math.max(TransY,BetweenY);
            }
            else{
                TransY = BetweenY;
            }

            if (pixelGrid.children[0].getBoundingClientRect().left > 100){
                TransX = Math.min(TransX,BetweenX);
            }
            else if (pixelGrid.children[gridSize-1].getBoundingClientRect().right < window.innerWidth -100){
                TransX = Math.max(TransX,BetweenX);
            }
            else{
                TransX = BetweenX;
            }

            updatePos(TransX,TransY); // Appliquer la translation 
        }

        if(dragImg){
            imagePreview.style.left = (e.clientX - imgOffsetX) + 'px';
            imagePreview.style.top = (e.clientY - imgOffsetY) + 'px';
        }
    };


    // Créer la grille au chargement de la page
    createPixelGrid();
    createColorGrid();
    updateZoom();
});


//pixelGrid.children[5]style.background = "F00000"
