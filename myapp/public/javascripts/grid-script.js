var link = document.createElement("link");
link.type = 'text/css';
link.rel = 'stylesheet';

//Pour la bdd

if (screen.width > 600)
{
    document.head.appendChild(link);
    link.href = 'stylesheets/styles.css';
}
else {
    document.head.appendChild(link);
    link.href = 'stylesheets/stylestel.css';
}

//function via d'autres fichiers  :
function getCookie(name) {
    // Permet de récupérer la valeur de notre cookie qui a le nom : name
    const value = document.cookie.split("; ").find(ele => ele.startsWith(name + "=")); 
    return value ? value.split("=")[1] : 0;  // Si le cookie existe, retourne la valeur sinon retourne none
}

document.addEventListener('DOMContentLoaded', () => {
    const colorGrid = document.getElementById('color-grid');
    const fileimage = document.getElementById('fileimage');
    const imagePreview = document.getElementById('imagePreview');
    const mode = document.getElementById('changeControl');
    const pseudo = document.getElementById('pseudo');
    const bubble = document.getElementById('bubble');
    const bubbleRect = bubble.getBoundingClientRect();

    const canvas = document.getElementById('pixelCanvas');
    const ctx = canvas.getContext('2d');
    const power = document.getElementById('containerTopPower');
    power.textContent = getCookie("power");

    let canvaSize = 150;
    let pixelSize = 10;

    let zoomLevel = [1.7,1]; // Niveau de zoom initial (1 = taille normale)  

    let drag = false;
    let dragImg = false;

    let currentColor = "#fff"
    let Lcolors = ["#FFFFFF", "#C0C0C0", "#808080", "#000000", "#FF0000", "#800000", "#FFFF00", "#808000", "#00FF00", "#008000", "#00FFFF", "#008080", "#0000FF", "#000080", "#FF00FF", "#800080"];

    let drawing = true;

    // Variables pour zoom et déplacement
    let offsetX = [window.innerWidth/2 - canvaSize/2*pixelSize*zoomLevel[0],0] ;
    let offsetY = [0,0];
    let offsetBubble = [0,0];
    let bubbleX = 0;
    let bubbleY = 0;
    let dragStartX, dragStartY;

    const pixels = {};
    for (let i = 0; i < canvaSize*canvaSize; i++) {
        const x = pixelSize * (i%canvaSize);               // Calcul de la position x
        const y = pixelSize * Math.floor(i/canvaSize); // Calcul de la position y
        const date = new Date();

        pixels[i] = {
            color: "#C0C0C0", // ou la couleur par défaut
            x: x,
            y: y,
            name:"none",
            date : new Date(),
            affiche : "none " + `${date.getDate()}/${date.getMonth()+1} à ${date.getHours()}:${date.getMinutes()}`
        };
    }

    // Resize du canvas pour qu'il remplisse la fenêtre
    function resizeCanvas() {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
        draw(); // Redessine au bon endroit après resize
    }

    // Dessiner un pixel à la position x,y
    function drawPixel(x, y) {
        if (y>=0 && x >=0 && y<=canvaSize && x <= canvaSize && +getCookie("power")>0){
            document.cookie =`power=${getCookie("power")-1}; path=/; max-age=`+2*60*1000;//2 min pour le cookie
            power.textContent = getCookie("power");
            pixels[y*canvaSize+x].color = currentColor;
            pixels[y*canvaSize+x].name = pseudo.dataset.message;/*self.seudo*/
            pixels[y*canvaSize+x].date = new Date();
            pixels[y*canvaSize+x].affiche = pixels[y*canvaSize+x].name + ` ${pixels[y*canvaSize+x].date.getDate()}/${pixels[y*canvaSize+x].date.getMonth()+1} à ${pixels[y*canvaSize+x].date.getHours()}:${pixels[y*canvaSize+x].date.getMinutes()}`;/*C'est les el affiche lorsqu'on hover un pixel.*/
            draw();
        }
    }

    document.addEventListener('wheel', (e) =>{
        //alert('DeltaY:', e.deltaY);
        e.preventDefault();
        if (e.deltaY>0 && zoomLevel[0] > 0.2){
            offsetX[0] = e.clientX - (e.clientX - offsetX[0]) * 0.9;
            offsetY[0] = e.clientY - (e.clientY - offsetY[0]) * 0.9;
            zoomLevel[0] *= 0.9;
        }
        else if(e.deltaY<0 && zoomLevel[0] < 6){
            offsetX[0] = e.clientX - (e.clientX - offsetX[0]) * 1.1;
            offsetY[0] = e.clientY - (e.clientY - offsetY[0]) * 1.1;
            zoomLevel[0] *= 1.1;
        }
        draw();
    },{passive : false});
    
    // Fonction pour créer la grille de couleur
    function createcolorGrid() {
        colorGrid.innerHTML = '';
        for (let i = 0; i < 8 * 2; i++) {
            const color = document.createElement('div');
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
                currentColor = `${color.style.backgroundColor}`;
            });
            colorGrid.appendChild(color);
        }
    }

    fileimage.addEventListener('change', function(event){

        const ImageEle = event.target.files[0];
        if (ImageEle && ImageEle.type.startsWith('image/')){

            const imgUrl = URL.createObjectURL(ImageEle);// crée l'url
            imagePreview.src = imgUrl;
            imagePreview.alt = "Image chargée avec succès";// sert a r
            if(drawing){
               imagePreview.style.transform = `scale(${zoomLevel[1]}) translateX(${offsetX[1]}px) translateY(${offsetY[1]}px)`; 
            }
            else{
                imagePreview.style.transform = `scale(${zoomLevel[0]}) translateX(${offsetX[0]}px) translateY(${offsetY[0]}px)`; 
            }
            
        }
        else{
            imagePreview.alt = "Fail to load image";
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
        offsetX.reverse();
        offsetY.reverse();
        zoomLevel.reverse();
    })

    // Redessiner tout
    function draw() {

        if (drawing){
            ctx.setTransform(zoomLevel[0], 0, 0, zoomLevel[0], offsetX[0], offsetY[0]);
            ctx.clearRect(-offsetX[0]/zoomLevel[0], -offsetY[0]/zoomLevel[0], canvas.width/zoomLevel[0], canvas.height/zoomLevel[0]);

            for (let keys in pixels) {
                ctx.fillStyle = pixels[keys].color;
                ctx.fillRect(pixels[keys].x, pixels[keys].y, pixelSize, pixelSize);
            }

            fetch('http://localhost:3000/api/donnees')
            .then(res => res.json())
            .then(data => {

                data.forEach(row => {
                    const color = row.color; // Récupère la couleur de chaque ligne
                    const x = row.x;         // Coordonnée x
                    const y = row.y;         // Coordonnée y
                    ctx.fillStyle = color;
                    ctx.fillRect(x, y, pixelSize, pixelSize);
                    });
            });
        }
        else{
            imagePreview.style.transform = `scale(${zoomLevel[0]}) translateX(${offsetX[0]/zoomLevel[0]}px) translateY(${offsetY[0]/zoomLevel[0]}px)`;
        }

        bubble.style.left = `${bubbleX + offsetBubble[0] + offsetX[0]}px`;
        bubble.style.top = `${bubbleY + offsetBubble[1] + offsetY[0]}px`;
    }

    function drawBubble(x,y){
        bubble.style.opacity = 1;
        bubble.textContent = `${pixels[y*canvaSize + x].affiche}`;
        bubbleX = x*pixelSize*zoomLevel[0] + offsetX[0] + pixelSize/2*zoomLevel[0];//pixelSize;
        bubbleY = y*pixelSize*zoomLevel[0] + offsetY[0] - bubbleRect.height/2;//pixelSize;
        bubble.style.left = `${bubbleX + offsetBubble[0] + offsetX[0]}px`;
        bubble.style.top = `${bubbleY + offsetBubble[1] + offsetY[0]}px`;
    };

    // Clic pour dessiner
    canvas.addEventListener('click', (e) => {
        const rect = canvas.getBoundingClientRect();
        const x = Math.floor((e.clientX - rect.left - offsetX[0]) / (zoomLevel[0] * pixelSize));
        const y = Math.floor((e.clientY - rect.top - offsetY[0]) / (zoomLevel[0] * pixelSize));

        if (drawing && Date.now() - startTime< 200){//tes si : click rapide ou + de 200ms
            drawPixel(x,y);
            drawBubble(x,y);
        }
        
    });

    document.addEventListener('mousedown', (e) =>{
        mooveGridBegin(e); 
        startTime = Date.now();
    });

    document.addEventListener('mousemove', (e) => {
        moovePixelGrid(e);
    });

    document.addEventListener('mouseup', (e) => {
        mooveGridEnd(e);
    });

    /*Pour les tels*/
    document.addEventListener('touchstart', (e) => {

        startTime = Date.now();
        
        if (e.touches.length === 2) {  // 
            // Deux doigts 
            e.preventDefault();

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
        e.preventDefault(); // bloquer le scroll tactile
        if (e.touches.length === 2){
            
            const dx = e.touches[0].clientX - e.touches[1].clientX;
            const dy = e.touches[0].clientY - e.touches[1].clientY;
            newDistance = Math.hypot(dx, dy);
            rapportDistance = newDistance/initDistance;
            zoomLevel[0] = initialZoom*rapportDistance;  
            draw();
        }

        else{
            moovePixelGrid(e.touches[0]);    
        }

    },{passive: false });


    function mooveGridBegin(e){
        drag = true;
        dragImg = true;
        dragStartX = e.clientX - offsetX[0];
        dragStartY = e.clientY - offsetY[0];
        [offsetBubble[0],offsetBubble[1]] = [0 - offsetX[0],0 - offsetY[0]];
    }

    function mooveGridEnd(e){
        drag = false;
        dragImg = false;
    }
        
    function moovePixelGrid (e){

        if(drag && drawing){
            offsetX[0] = e.clientX - dragStartX;
            offsetY[0] = e.clientY - dragStartY;
            draw();
        }

        else if(dragImg && !drawing){
            offsetX[0] = e.clientX - dragStartX;
            offsetY[0] = e.clientY - dragStartY;
            draw();
        }
    };

    document.addEventListener('contextmenu', function(e) {
        e.preventDefault();
        const rect = canvas.getBoundingClientRect();
        const x = Math.floor((e.clientX - rect.left - offsetX[0]) / (zoomLevel[0] * pixelSize));
        const y = Math.floor((e.clientY - rect.top - offsetY[0]) / (zoomLevel[0] * pixelSize));
        drawBubble(x,y);
    });

    document.addEventListener('dblclick', function(event) { //Previens le zoom quand clique 2x
        event.preventDefault();
    });
      

    // Créer la grille au chargement de la page
    createcolorGrid();
    resizeCanvas();
});
