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
    const colorGrid = document.getElementById('color-grid');
    const fileimage = document.getElementById('fileimage');
    const imagePreview = document.getElementById('imagePreview');
    const mode = document.getElementById('changeControl');
    const pseudo = document.getElementById('pseudo');
    const bubble = document.getElementById('bubble');
    const canvas = document.getElementById('pixelCanvas');
    const ctx = canvas.getContext('2d');

    const gridSize = 100; // r
    let canvaSize = 100;
    let pixelSize = 10;

    let zoomLevel = [1,1]; // Niveau de zoom initial (1 = taille normale)  

    let StartX = 0;
    let StartY = 0;
    let TransX = 0;
    let TransY = 0;
    let CurrentX = [0,0];
    let CurrentY = [0,0];
    let drag = false;
    
    let imgOffsetX = 0;
    let imgOffsetY = 0;
    let dragImg = true;

    let color = "#fff"
    let Lcolors = ["#FFFFFF", "#C0C0C0", "#808080", "#000000", "#FF0000", "#800000", "#FFFF00", "#808000", "#00FF00", "#008000", "#00FFFF", "#008080", "#0000FF", "#000080", "#FF00FF", "#800080"];

    let drawing = true;

    // Variables pour zoom et déplacement
    let offsetX = 0;
    let offsetY = 0;
    let dragStartX, dragStartY;

    const pixels = {};
    for (let i = 0; i < canvaSize*canvaSize; i++) {
        const x = pixelSize * (i%100);               // Calcul de la position x
        const y = pixelSize * Math.floor(i/100); // Calcul de la position y
        pixels[i] = {
            color: "#FF0000", // ou la couleur par défaut
            x: x,
            y: y
        };
    }

    // Resize du canvas pour qu'il remplisse la fenêtre
    function resizeCanvas() {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
        draw(); // Redessine au bon endroit après resize
    }
    window.addEventListener('resize', resizeCanvas);
    resizeCanvas();

    // Dessiner un pixel à la position x,y
    function drawPixel(x, y) {
        if (y>=0 && x >=0 && y<=canvaSize^2 && x <= canvaSize^2){
            pixels[y*100+x].color = Color;
            draw();
        }
    }

    // Redessiner tout
    function draw() {
        ctx.setTransform(zoomLevel[0], 0, 0, zoomLevel[0], offsetX, offsetY);
        ctx.clearRect(-offsetX/zoomLevel[0], -offsetY/zoomLevel[0], canvas.width/zoomLevel[0], canvas.height/zoomLevel[0]);

        for (let keys in pixels) {
            ctx.fillStyle = pixels[keys].color;
            ctx.fillRect(pixels[keys].x, pixels[keys].y, pixelSize, pixelSize);
        }
    }
    // Clic pour dessiner
    canvas.addEventListener('click', (e) => {
        const rect = canvas.getBoundingClientRect();
        const x = (e.clientX - rect.left - offsetX) / (zoomLevel[0] * pixelSize);
        const y = (e.clientY - rect.top - offsetY) / (zoomLevel[0] * pixelSize);

        drawPixel(Math.floor(x), Math.floor(y));
    });

    // Drag pour bouger
    canvas.addEventListener('mousedown', (e) => {
        drag = true;
        dragStartX = e.clientX - offsetX;
        dragStartY = e.clientY - offsetY;
    });

    canvas.addEventListener('mousemove', (e) => {
        if (drag) {
            offsetX = e.clientX - dragStartX;
            offsetY = e.clientY - dragStartY;
            draw();
        }
    });

    canvas.addEventListener('mouseup', () => {
        drag = false;
    });

    canvas.addEventListener('mouseleave', () => {
        drag = false;
    });

    // Molette pour zoomer
    canvas.addEventListener('wheel', (e) => {
        e.preventDefault();
        const zoomIntensity = 0.1;
        const mouseX = e.clientX;
        const mouseY = e.clientY;
        const delta = e.deltaY > 0 ? -1 : 1;
        const zoom = 1 + delta * zoomIntensity;

        offsetX = mouseX - (mouseX - offsetX) * zoom;
        offsetY = mouseY - (mouseY - offsetY) * zoom;
        draw();

    }, { passive: false });

    document.addEventListener('wheel', (e) =>{
        //alert('DeltaY:', e.deltaY);
        if (e.deltaY>0 && zoomLevel[0] > 0.8){
            zoomLevel[0] -= 0.4;
        }
        else if(e.deltaY<0 && zoomLevel[0] < 6){
            zoomLevel[0] += 0.4;
        }
        offsetX = mouseX - (mouseX - offsetX) * zoom;
        offsetY = mouseY - (mouseY - offsetY) * zoom;
        draw();
        updateZoom();
    });
    

    // Fonction pour créer la grille de pixels
    function createPixelGrid() {
        pixelGrid.innerHTML = '';
        for (let i = 0; i < gridSize * gridSize; i++) {
            const pixel = document.createElement('div');
            pixel.classList.add('pixel');

            pixel.name = "None "; //Va devoir recupere ces vaeurs depuis la base de donnée
            pixel.date = new Date();
            pixel.setAttribute('data-tooltip', pixel.name + `${pixel.date.getDate()}/${pixel.date.getMonth()+1} à ${pixel.date.getHours()}:${pixel.date.getMinutes()}`);/*C'est les el affiche lorsqu'on hover un pixel.*/

            pixel.addEventListener('mousedown',() => startTime = Date.now());
            pixel.addEventListener('touchstart',() => startTime = Date.now());

            pixel.addEventListener('click', () => {
                if (drawing && Date.now() - startTime < 200){  //Après mettre si a asssez de recharge
                    pixel.style.backgroundcolor = color;
                    pixel.name = pseudo.dataset.message;/*self.seudo*/
                    pixel.date = new Date();
                    pixel.setAttribute('data-tooltip', pixel.name + ` ${pixel.date.getDate()}/${pixel.date.getMonth()+1} à ${pixel.date.getHours()}:${pixel.date.getMinutes()}`);/*C'est les el affiche lorsqu'on hover un pixel.*/
        
                }                
                //si clic droit
                bubble.style.display = 'flex';
                bubble.textContent = pixel.getAttribute('data-tooltip');                
                rect = pixel.getBoundingClientRect();
                rectBubble = bubble.getBoundingClientRect();
                bubble.style.left = `${rect.left + rect.width/2 - rectBubble.width*0.5}px`;
                bubble.style.top = `${rect.top}px`;
            });

            pixelGrid.appendChild(pixel);
        }
    }

    // Fonction pour créer la grille de couleur
    function createcolorGrid() {
        colorGrid.innerHTML = '';
        for (let i = 0; i < 8 * 2; i++) {
            const color = document.createElement('div');
            //pixel.innerHTML += 
            color.classList.add('color');
            color.style.background = Lcolors[i]

            if (i == 0){
                Choosecolor = color;
                Choosecolor.style.border = "0.7vh solid black";
            }
            color.addEventListener('click', () => {
                // Set the border style
                Choosecolor.style.border = "0vh solid black";
                Choosecolor = color;
                Choosecolor.style.border = "0.7vh solid black";
                color = color.style.backgroundcolor;
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
            if(drawing){
               imagePreview.style.transform = `scale(${zoomLevel}) translateX(${CurrentX[1]}px) translateY(${CurrentY[1]}px)`; 
            }
            else{
                imagePreview.style.transform = `scale(${zoomLevel}) translateX(${CurrentX[0]}px) translateY(${CurrentY[0]}px)`; 
            }
            
        }
        else{
            imagePreview.alt = "Fail to load image";
        }
    });

    document.addEventListener('dblclick', function(event) { //Previens le zoom quand clique 2x
        event.preventDefault();
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
        CurrentX.reverse();
        CurrentY.reverse();
        zoomLevel.reverse();
    })

    // Appliquer l'échelle de zoom à la grille
    function updateZoom() {

        if (drawing){
            pixelGrid.style.transform = `scale(${zoomLevel[0]}) translateX(${TransX}px) translateY(${TransY}px)`;
        }
        else{
            imagePreview.style.transform = `scale(${zoomLevel[0]}) translateX(${TransX}px) translateY(${TransY}px)`;
        }
        
    };

    function updatePos(X,Y){
        if (drawing){
            pixelGrid.style.transform = `scale(${zoomLevel[0]}) translateX(${X}px) translateY(${Y}px)`; 
        }
        else{
            imagePreview.style.transform = `scale(${zoomLevel[0]}) translateX(${X}px) translateY(${Y}px)`; 
        }
    }

    /*Pour les pc*/
    pixelGrid.addEventListener('mousedown', (e) => {
        mooveGridBegin(e);
    });

    document.addEventListener('mouseup', (e) => {
        mooveGridEnd(e);
    });

    document.addEventListener('mousemove',(e) =>{ 
        moovePixelGrid(e);
    });

    /*Pour les tels*/
    pixelGrid.addEventListener('touchstart', (e) => {
        
        if (e.touches.length === 2) {  // 
            // Deux doigts 
            const dx = e.touches[0].clientX - e.touches[1].clientX;
            const dy = e.touches[0].clientY - e.touches[1].clientY;
            initDistance = Math.hypot(dx, dy);
            initialZoom = zoomLevel[0];

        } else if (e.touches.length === 1) {  // 1 doigt
            mooveGridBegin(e.touches[0]);
        }

    },{passive : false});

    document.addEventListener('touchend', (e) => {
        mooveGridEnd(e.changedTouches[0]);
    });

    document.addEventListener('touchmove', (e) => {

        if (e.touches.length === 2){
            e.preventDefault(); // bloquer le scroll tactile
            const dx = e.touches[0].clientX - e.touches[1].clientX;
            const dy = e.touches[0].clientY - e.touches[1].clientY;
            newDistance = Math.hypot(dx, dy);
            rapportDistance = newDistance/initDistance;
            zoomLevel[0] = initialZoom*rapportDistance;  
            updateZoom();
        }

        else{
            e.preventDefault(); // bloquer le scroll tactile
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
        CurrentX[0] = TransX;
        CurrentY[0] = TransY;     
    }
        
    function moovePixelGrid (e){

        if(drag){
            BetweenY = CurrentY[0] + (e.clientY - StartY)/zoomLevel[0];
            BetweenX = CurrentX[0] + (e.clientX - StartX)/zoomLevel[0];

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
    createcolorGrid();
    updateZoom();
});


//pixelGrid.children[5]style.background = "F00000"
