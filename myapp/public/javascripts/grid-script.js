var link = document.createElement("link");
link.type = 'text/css';
link.rel = 'stylesheet';

let powerBase =  7;
let delay = 5;

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

//----------------------------------Cookie----------------------------------

//function via d'autres fichiers  :
function getCookie(name) {
    // Permet de récupérer la valeur de notre cookie qui a le nom : name
    const value = document.cookie.split("; ").find(ele => ele.startsWith(name + "=")); 
    return value ? value.split("=")[1] : 0;  // Si le cookie existe, retourne la valeur sinon retourne none
}

//-----------------------------------Animation-----------------------------------
const bgslide = document.getElementById('bgGoogle');
window.addEventListener('load', function() {
    requestAnimationFrame(() => {
        // Petite attente pour garantir le repaint
        setTimeout(() => {
            if (popup != null) {
                alert(popup);
            }
            bgslide.classList.add('slide-up');
        }, 50); // 50ms suffisent généralement
    });

});


document.addEventListener('DOMContentLoaded', () => {

    const colorGrid = document.getElementById('color-grid');
    //const pseudo = document.getElementById('pseudo').dataset.message;
    const bubble = document.getElementById('bubble');
    const bubbleRect = bubble.getBoundingClientRect();

    const power = document.getElementById('containerPower');
    power.textContent = power.dataset.count;
    var rotate = false;

    if (power.dataset.count <= 0){
        startCountdown(delay-Math.round(power.dataset.time/1000));
    }
    

    //socket : 
    const socket = io();

    const canvas = document.getElementById('pixelCanvas');
    const ctx = canvas.getContext('2d');

    let canvaSize = 40;
    let pixelSize = 10;

    let zoomLevel = 1; // Niveau de zoom initial (1 = taille normale)

    let drag = false;

    let currentColor = "#fff"
    let Lcolors = ["#FFFFFF", "#C0C0C0", "#808080", "#000000", "#FF0000", "#800000", "#FFFF00", "#808000", "#00FF00", "#008000", "#00FFFF", "#008080", "#0000FF", "#000080", "#FF00FF", "#800080"];

    // Variables pour zoom et déplacement
    let offsetX = window.innerWidth/2 - canvaSize/2*pixelSize*zoomLevel ;
    let offsetY = 0;
    let offsetBubble = [0,0];
    let bubbleX = 0;
    let bubbleY = 0;
    let dragStartX, dragStartY;

    const pixels = {};
    Object.values(pixelsBdd).forEach(({x,y,color,affiche}) => {
        
        pixels[canvaSize*y+x] = {
            
            color: color, // ou la couleur par défaut
            x: x*pixelSize,
            y: y*pixelSize,
            affiche : affiche //+ `${date.getDate()}/${date.getMonth()+1} à ${date.getHours()}:${date.getMinutes()}`
        };
    });

    // Resize du canvas pour qu'il remplisse la fenêtre
    function resizeCanvas() {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
        draw(); // Redessine au bon endroit après resize
    }

    // Dessiner un pixel à la position x,y
    function drawPixel(x, y, color, affiche) {
        pixels[y*canvaSize+x].color = color;
        pixels[y*canvaSize+x].name = pseudo;/*self.seudo*/
        date = new Date();
        pixels[y*canvaSize+x].affiche = affiche;//pixels[y*canvaSize+x].name + ` ${date.getDate()}/${date.getMonth()+1} à ${date.getHours()}:${date.getMinutes()}`;/*C'est les el affiche lorsqu'on hover un pixel.*/
        
        draw();
    }
    
    socket.on('pixelUpdate', (data) => {
        // Mettre à jour la couleur du pixel 
        drawPixel(data.x,data.y,data.color,data.affiche);
    });
    
    
    document.addEventListener('wheel', (e) =>{
        //alert('DeltaY:', e.deltaY);
        e.preventDefault();
        if (e.deltaY>0 && zoomLevel > 0.2){
            offsetX = e.clientX - (e.clientX - offsetX) * 0.9;
            offsetY = e.clientY - (e.clientY - offsetY) * 0.9;
            zoomLevel *= 0.9;
        }
        else if(e.deltaY<0 && zoomLevel < 6){
            offsetX = e.clientX - (e.clientX - offsetX) * 1.1;
            offsetY = e.clientY - (e.clientY - offsetY) * 1.1;
            zoomLevel *= 1.1;
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

    // Redessiner tout
    function draw() {

        ctx.setTransform(zoomLevel, 0, 0, zoomLevel, offsetX, offsetY);
        ctx.clearRect(-offsetX/zoomLevel, -offsetY/zoomLevel, canvas.width/zoomLevel, canvas.height/zoomLevel);

        for (let keys in pixels) {
            ctx.fillStyle = pixels[keys].color;
            ctx.fillRect(pixels[keys].x, pixels[keys].y, pixelSize, pixelSize);

        }

        bubble.style.left = `${bubbleX + offsetBubble[0] + offsetX}px`;
        bubble.style.top = `${bubbleY + offsetBubble[1] + offsetY}px`;
    }

    function drawBubble(x,y){
        bubble.style.opacity = 1;
        bubble.textContent = `${pixels[y*canvaSize + x].affiche}`;
        bubbleX = x*pixelSize*zoomLevel + offsetX + pixelSize/2*zoomLevel;//pixelSize;
        bubbleY = y*pixelSize*zoomLevel + offsetY - bubbleRect.height/2;//pixelSize;
        bubble.style.left = `${bubbleX + offsetBubble[0] + offsetX}px`;
        bubble.style.top = `${bubbleY + offsetBubble[1] + offsetY}px`;
    };

    // Clic pour dessiner
    canvas.addEventListener('click', (e) => {
        const rect = canvas.getBoundingClientRect();
        const x = Math.floor((e.clientX - rect.left - offsetX) / (zoomLevel * pixelSize));
        const y = Math.floor((e.clientY - rect.top - offsetY) / (zoomLevel * pixelSize));

        if (Date.now() - startTime< 200){//tes si : click rapide ou + de 200ms
            if (y>=0 && x >=0 && y<=canvaSize && x <= canvaSize && power.dataset.count > 0){
                date = new Date();
                socket.emit('power',{x:x,y:y,color:currentColor,affiche:pseudo + ` ${date.getDate()}/${date.getMonth()+1} à ${date.getHours()}:${date.getMinutes()<10 ? "0" : ""}${date.getMinutes()}`});
                power.dataset.count -= 1;
                power.textContent = power.dataset.count;
                if (power.dataset.count < 1){
                    startCountdown(delay);
                }
            }
        }
        else{
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
        
        if (e.touches.length === 2) {  // Deux doigts
            e.preventDefault();
            const dx = e.touches[0].clientX - e.touches[1].clientX;
            const dy = e.touches[0].clientY - e.touches[1].clientY;
            initDistance = Math.hypot(dx, dy);
            initialZoom = zoomLevel;
            mooveGridBegin(e.touches[0]);

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
            zoomdiff = initialZoom*rapportDistance/zoomLevel
            zoomLevel = initialZoom*rapportDistance;  

            offsetX = e.touches[0].clientX - (e.touches[0].clientX - offsetX) * zoomdiff;
            offsetY = e.touches[0].clientY - (e.touches[0].clientY - offsetY) * zoomdiff;

            draw();
        }

        else{
            moovePixelGrid(e.touches[0]);    
        }

    },{passive: false });


    function mooveGridBegin(e){
        drag = true;
        dragStartX = e.clientX - offsetX;
        dragStartY = e.clientY - offsetY;
        [offsetBubble[0],offsetBubble[1]] = [0 - offsetX,0 - offsetY];
    }

    function mooveGridEnd(e){
        drag = false;
    }

    function moovePixelGrid (e){
        if(drag){
            offsetX = e.clientX - dragStartX;
            offsetY = e.clientY - dragStartY;
            draw();
        }
    };

    document.addEventListener('contextmenu', function(e) {
        e.preventDefault();
        const rect = canvas.getBoundingClientRect();
        const x = Math.floor((e.clientX - rect.left - offsetX) / (zoomLevel * pixelSize));
        const y = Math.floor((e.clientY - rect.top - offsetY) / (zoomLevel * pixelSize));
        drawBubble(x,y);
    });

    document.addEventListener('dblclick', function(event) { //Previens le zoom quand clique 2x
        event.preventDefault();
    });

    function startCountdown(sec) {
        power.style.transform = rotate ? "rotateY(0deg)":"rotateY(360deg)";
        rotate = !rotate;
        sec = sec;
        min = Math.floor(sec/60);
        sec = sec%60;
        power.textContent = `${min}:${sec<10 ? 0 : ""}${sec}`;//Celui de base

        const countdown = setInterval(() => {
            sec--;
            if (sec > -1){
            power.textContent = `${min}:${sec<10 ? 0 : ""}${sec}`;
            }
            if (sec < 0) {
                
                if (min > 0) {
                    min--;
                    sec = 59;
                    
                } else {
                    power.dataset.count = powerBase;
                    power.textContent = power.dataset.count;
                    power.style.transform = rotate ? "rotateY(0deg)":"rotateY(360deg)";
                    rotate = !rotate;
                    clearInterval(countdown);
            }}
            
            }, 1000);
    }

    // Créer la grille au chargement de la page
    createcolorGrid();
    resizeCanvas();
});


//<button id="changeControl">Drawing</button>
/*            <div class="imageFile-controls">
                <label for="fileimage" class="file-label" style="color:rgb(255, 255, 255);">File</label>
                <input type="file" id="fileimage" accept="image/*" style="display : none">
            </div>*/