document.addEventListener('DOMContentLoaded', () => {
    const pixelGrid = document.getElementById('pixel-grid');
    const zoomInBtn = document.getElementById('zoom-in');
    const zoomOutBtn = document.getElementById('zoom-out');
    const colorGrid = document.getElementById('color-grid');
    const fileimage = document.getElementById('fileimage');
    const imagePreview = document.getElementById('imagePreview');
    const btnimage = document.getElementById('moovefile');

    const gridSize = 100; // Taille de la grille (50x50 pixels)
    let zoomLevel = 1; // Niveau de zoom initial (1 = taille normale)
    const zoomFactor = 0.2; // Facteur de zoom
    const mooveFactorY = (gridSize * 9);
    const mooveFactorX = (gridSize * 8);

    //let CurrentPseudo = localStorage.getItem("name");
    //alert("Pseudo : " + CurrentPseudo);

    let StartX = 0;
    let StartY = 0;
    let TransX = 0;
    let TransY = 0;
    let CurrentX = 0;
    let CurrentY = 0;
    let drag = false;
    
    let imgOffsetX = 0;
    let imfOffsetY = 0;
    let dragImg = false;

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

        console.log('nice');

        const ImageEle = event.target.files[0];
        if (ImageEle && ImageEle.type.startsWith('image/')){

            const imgUrl = URL.createObjectURL(ImageEle);// crée l'url
            console.log('nice');
            imagePreview.src = imgUrl;
            imagePreview.alt = "Image chargée avec succès";// sert a r
            
        }
        else{
            imagePreview.alt = "Fail to load image";
        }


    });

    btnimage.addEventListener('click',()=>{
        dragImg = true;
    });

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
        drag = true;
        dragImg = true;
        StartX = e.clientX;
        StartY = e.clientY;

        imgOffsetX = e.clientX - imagePreview.offsetLeft;
        imgOffsetX = e.clientY - imagePreview.offsetTop;
    });

    pixelGrid.addEventListener('mouseup', (e) => {
        drag = false;
        dragImg = false;
        CurrentX = TransX;
        CurrentY = TransY;
    });

    document.addEventListener('mousemove',(e) =>{   

        if(drag){

            if(Math.abs(BetweenY) < mooveFactorY-window.innerHeight/(zoomLevel*2)+20 ){
                // See if can moove without leaving the screen
                TransY = CurrentX + (e.clientX - StartX)/zoomLevel;
            }

            if (Math.abs(BetweenX) < mooveFactorX-window.innerWidth/(zoomLevel*2)+50 ){
                // See if can moove without leaving the screen
                
                TransX = CurrentY + (e.clientY - StartY)/zoomLevel;         
            }

            updatePos(TransX,TransY); // Appliquer la translation 
        }

        if(dragImg){
            imagePreview.style.left = (e.clientX - offsetX) + 'px';
            imagePreview.style.top = (e.clientY - offsetY) + 'px';
        }




    });


    // Créer la grille au chargement de la page
    createPixelGrid();
    createColorGrid();
});


//pixelGrid.children[5]style.background = "F00000"
