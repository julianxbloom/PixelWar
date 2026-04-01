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

//----------------------------------Cookie----------------------------------

//function via d'autres fichiers  :
function getCookie(name) {
    // Permet de récupérer la valeur de notre cookie qui a le nom : name
    const value = document.cookie.split("; ").find(ele => ele.startsWith(name + "=")); 
    return value ? value.split("=")[1] : 0;  // Si le cookie existe, retourne la valeur sinon retourne none
}

//-----Button
document.getElementById("BtnHome").addEventListener("click", function(){
    window.location.href = "/";
});

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
        }, 1000); // 50ms suffisent généralement
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
        startCountdown((new Date().getHours() == hourRaid? delayRaid:delay)-Math.round(power.dataset.time/1000));
    }

    //-----Button
    document.getElementById("BtnSwitchColor").addEventListener("click", function(){
        switch_color();
    });
    
    //socket : 
    const socket = io();

    const canvas = document.getElementById('pixelCanvas');
    const ctx = canvas.getContext('2d');

    // Offscreen canvas buffer // Hidden canva
    const offscreen = document.createElement("canvas");
    offscreen.width = canvaSize;  // 500 ou 1000
    offscreen.height = canvaSize;
    const offCtx = offscreen.getContext("2d");

    window.OffscreenCanvas = offscreen; //Pour y acceder depuis puppeteer

    let pixelSize = 10;
    let startTime = Date.now();

    let zoomLevel = 0.3; // Niveau de zoom initial (1 = taille normale)

    let drag = false;
    let countdown;

    let currentColor = 0;
    let Lcolors = [
        "rgb(255, 255, 255)", // #FFFFFF
        "rgb(192, 192, 192)", // #C0C0C0
        "rgb(128, 128, 128)", // #808080
        "rgb(0, 0, 0)",       // #000000
        "rgb(255, 0, 0)",     // #FF0000
        "rgb(128, 0, 0)",     // #800000
        "rgb(255, 255, 0)",   // #FFFF00
        "rgb(255, 128, 0)",   // #008080
        "rgb(128, 64, 0)",   // #808000
        "rgb(0, 255, 0)",     // #00FF00
        "rgb(0, 128, 0)",     // #008000
        "rgb(0, 255, 255)",   // #00FFFF
        "rgb(0, 0, 255)",     // #0000FF
        "rgb(0, 0, 128)",     // #000080
        "rgb(255, 0, 255)",   // #FF00FF
        "rgb(128, 0, 128)",    // #800080

        // Palette complémentaire (contraste max avec les tiennes)
        "rgb(255, 200, 200)", // rose pâle
        "rgb(255, 150, 150)",
        "rgb(255, 220, 180)", // pêche
        "rgb(255, 200, 120)",
        "rgb(255, 255, 180)", // jaune pâle
        "rgb(200, 200, 100)",
        "rgb(200, 255, 200)", // vert pastel
        "rgb(150, 220, 150)",
        "rgb(200, 255, 255)", // cyan pastel
        "rgb(150, 220, 220)",
        "rgb(200, 200, 255)", // bleu pastel
        "rgb(150, 150, 220)",
        "rgb(230, 200, 255)", // violet clair
        "rgb(200, 150, 255)",
        "rgb(180, 140, 100)", // marron clair
        "rgb(120, 90, 60)",    // marron foncé

                // 🌸 Roses
        "rgb(180, 80, 80)",     // rose foncé
        "rgb(200, 60, 60)",

        // 🍑 Pêche / orange doux
        "rgb(200, 140, 90)",
        "rgb(180, 120, 60)",

        // 🟡 Jaune (plus profond)
        "rgb(140, 140, 40)",

        // 🟢 Vert
        "rgb(80, 180, 80)",
        "rgb(40, 140, 40)",

        // 🧊 Cyan
        "rgb(80, 180, 180)",
        "rgb(40, 140, 140)",

        // 🔵 Bleu
        "rgb(80, 80, 180)",
        "rgb(40, 40, 140)",

        // 🟣 Violet
        "rgb(110, 50, 180)",

        // 🟤 Marron
        "rgb(220, 220, 220)", // #C0C0C0
        "rgb(80, 80, 80)", // #808080
        "rgb(40, 40, 40)",       // #000000
        "rgb(90, 60, 40)"
        
    ];

    // Variables pour zoom et déplacement
    let offsetX = window.innerWidth/2 - canvaSize/2*pixelSize*zoomLevel ;
    let offsetY = 0;
    let offsetBubble = [0,0];
    let bubbleX = 0;
    let bubbleY = 0;
    let dragStartX, dragStartY;
    let pixels = new Uint8Array(canvaSize*canvaSize); //Faios * car x * y

    function updateGrid(px){
        let x = 0;
        let y = 0;
        //const size = length(px);
        px.forEach(({color}) => {
            //console.log(color);

            pixels[y*canvaSize+x]=color;

            //Draw the pixel
            offCtx.fillStyle = Lcolors[color];
            offCtx.fillRect(x, y, 1, 1);
            
            //pixels[canvaSize*y+x] = {
            //    
            //    color: color, // ou la couleur par défaut
            //    //x: x*pixelSize,
            //    //y: y*pixelSize,
            //    affiche : "None"//affiche //+ `${date.getDate()}/${date.getMonth()+1} à ${date.getHours()}:${date.getMinutes()}`
            //};
            x++;
            if(x>=canvaSize){
                y++;
                x=0;
            }
        });
        draw();
    }

    //updateGrid(pixelsBdd)

    // Resize du canvas pour qu'il remplisse la fenêtre
    function resizeCanvas() {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;

        draw(); // Redessine au bon endroit après resize
    }

    // Dessiner un pixel à la position x,y
    function drawPixel(x, y, color_id){//, affiche) {
        pixels[y*canvaSize+x]=color_id

        //Draw 1 pixel
        offCtx.fillStyle = Lcolors[color_id];
        offCtx.fillRect(x, y, 1, 1);
        //pixels[y*canvaSize+x].color = color;
        //pixels[y*canvaSize+x].name = pseudo;/*self.seudo*/
        //date = new Date();
        //pixels[y*canvaSize+x].affiche = affiche;//pixels[y*canvaSize+x].name + ` ${date.getDate()}/${date.getMonth()+1} à ${date.getHours()}:${date.getMinutes()}`;/*C'est les el affiche lorsqu'on hover un pixel.*/
        draw();
    }
    
    socket.on('pixelUpdate', (data) => {
        // Mettre à jour la couleur du pixel 
        drawPixel(data.x,data.y,data.color,data.affiche);
    });

    //------------------Reload------------------
    socket.on('reloadServeur', () => {
        window.location.reload();
    });

    btn = document.getElementById('BtnReload');
    if (admin){
        //console.log("Btn doit apparaitre !");
        btn.style.display = "flex";
        btn.addEventListener('touchstart', function() {
            socket.emit("reload");
        });
        btn.addEventListener('mousedown', function() {
            socket.emit("reload");
        });
    }

    window.addEventListener("focus",()=>{
        window.location.reload();
        //socket.emit('requestSync');
        //socket.emit('requestPower');
    });

    //------------------Refresh------------------
    socket.on('connect', () => {
        socket.emit('requestSync');
    });

    socket.on('bubble_text',(data)=>{
        bubble.textContent=data.text;
    })

    socket.on('powerCookie', ({ power }) => {
    document.cookie = `power=${power}; path=/; max-age=${7*24*60*60*1000}`; // 2 minutes
    });

    socket.on('powerUpdate', (data) => {
        power.dataset.count = data.power;
        power.textContent = power.dataset.count;
        power.dataset.time = data.time;
        //console.log(power.dataset.count, power.dataset.time);
        
        if (typeof countdown !== "undefined") {
            clearInterval(countdown);
        }
        if (power.dataset.count <= 0){
            startCountdown((new Date().getHours() == hourRaid? delayRaid:delay)-Math.round(power.dataset.time/1000));
        }
    });

    socket.on('syncPixels', (data) => {
        updateGrid(data.pixels,data.y);
    });
    
    document.addEventListener('wheel', (e) =>{
        //alert('DeltaY:', e.deltaY);
        e.preventDefault();
        if (e.deltaY>0 && zoomLevel > 0.05){
            offsetX = e.clientX - (e.clientX - offsetX) * 0.9;
            offsetY = e.clientY - (e.clientY - offsetY) * 0.9;
            zoomLevel *= 0.9;
        }
        else if(e.deltaY<0 && zoomLevel < 20){
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
            color.id = i;

            if (i == 0){
                Choosecolor = color;
                Choosecolor.style.border = "0.7vh solid black";
                Choosecolor.style.borderTopLeftRadius = "12px";
            }
            else {
                color.style.border = "0.7vh solid transparent";
                if(i==8){
                    color.style.borderBottomLeftRadius = "12px";
                }
            }
            color.addEventListener('click', (e) => {
                // Set the border style
                Choosecolor.style.border = "0.7vh solid transparent";
                Choosecolor = color;
                Choosecolor.style.border = color.style.background=="rgb(0, 0, 0)"? "0.7vh solid white":"0.7vh solid black";

                //Choosecolor.style.border = "0.7vh solid black";
                currentColor = color.id;
            }, {passive: false});
            colorGrid.appendChild(color);
        }

    }

    function switch_color(){
        
        let add = 0;

        if (colorGrid.children[0].id == 0){
            add = 16;
        }
        else if(colorGrid.children[0].id == 16){
            add = 32;
        }
        else {
            add = 0;
        }

        for (let i = 0; i < 8 * 2; i++) {

            //let id = colorGrid.children[i].id;

            colorGrid.children[i].style.background = Lcolors[i+add];
            colorGrid.children[i].id =add+i;
            //console.log("New id :",colorGrid.children[i].id);
        }
    }

    // Redessiner tout
    function draw() {

        if(!pixels) return;

            ctx.setTransform(1,0,0,1,0,0);
            ctx.clearRect(0,0,canvas.width,canvas.height);

            ctx.imageSmoothingEnabled = false;

            ctx.setTransform(zoomLevel,0,0,zoomLevel,offsetX,offsetY);

            ctx.drawImage(
                offscreen,
                0,
                0,
                offscreen.width,
                offscreen.height,
                0,
                0,
                offscreen.width*pixelSize,
                offscreen.height*pixelSize
            );

        //ctx.setTransform(zoomLevel, 0, 0, zoomLevel, offsetX, offsetY);
        //ctx.clearRect(-offsetX/zoomLevel, -offsetY/zoomLevel, canvas.width/zoomLevel, canvas.height/zoomLevel);
//
        //let x = 0;
        //let y = 0;
        //for (const color_id of pixels) {
        //    //console.log(color_id)
        //    ctx.fillStyle = Lcolors[color_id];
        //    ctx.fillRect(x*pixelSize, y*pixelSize, pixelSize, pixelSize);
        //    x++;
        //    if(x>=canvaSize){
        //        x=0;
        //        y++;
        //    }       
        //}

        bubble.style.left = `${bubbleX + offsetBubble[0] + offsetX}px`;
        bubble.style.top = `${bubbleY + offsetBubble[1] + offsetY}px`;
    }

    function drawBubble(x,y){
        bubble.style.opacity = 1;
        bubble.textContent = "Incoming";//`${pixels[y*canvaSize + x].affiche}`;
        bubbleX = x*pixelSize*zoomLevel + offsetX + pixelSize/2*zoomLevel;//pixelSize;
        bubbleY = y*pixelSize*zoomLevel + offsetY - bubbleRect.height/2;//pixelSize;
        bubble.style.left = `${bubbleX + offsetBubble[0] + offsetX}px`;
        bubble.style.top = `${bubbleY + offsetBubble[1] + offsetY}px`;

        socket.emit('bubble_display',{
            x:x,
            y:y
        });
    };

    // Clic pour dessiner
    /*canvas.addEventListener('click', (e) => {

    });*/

    document.addEventListener('mousedown', (e) =>{
        if (e.target.closest('#containerBottom')) return;
        if (e.target.closest('a')) {
            // C'est un clic sur un lien ⇒ laisser passer
            return;
        }

        mooveGridBegin(e);
        startTime = Date.now();

        const bubbleTimeout = setTimeout(() => {
            if (drag){
                    //Draw bubble après 0.5second
            const rect = canvas.getBoundingClientRect();
            const x = Math.floor((e.clientX - rect.left - offsetX) / (zoomLevel * pixelSize));
            const y = Math.floor((e.clientY - rect.top - offsetY) / (zoomLevel * pixelSize));
            if(y>=0 && x >=0 && y<=canvaSize && x <= canvaSize){
                drawBubble(x, y);
            }
            }
        }, 500);
    });

    document.addEventListener('mousemove', (e) => {
        moovePixelGrid(e);
    });

    document.addEventListener('mouseup', (e) => {
        //console.log(hourRaid,delayRaid,delay, new Date().getHours());
        mooveGridEnd(e);
        bubble.style.opacity = 0;

        if (e.button === 2) return; // Ignore right-clicks

        const rect = canvas.getBoundingClientRect();
        const x = Math.floor((e.clientX - rect.left - offsetX) / (zoomLevel * pixelSize));
        const y = Math.floor((e.clientY - rect.top - offsetY) / (zoomLevel * pixelSize));

        if (Date.now() - startTime< 200){//tes si : click rapide ou + de 200ms
            if (y>=0 && x >=0 && y<=canvaSize && x <= canvaSize && power.dataset.count > 0 && currentColor != pixels[y*canvaSize+x]){
                

                date = new Date();
                socket.emit('power',{x:x,y:y,color:currentColor,affiche:pseudo + ` ${date.getDate()}/${date.getMonth()+1} à ${date.getHours()}:${date.getMinutes()<10 ? "0" : ""}${date.getMinutes()}`});
                if (!admin){
                    power.dataset.count -= 1;
                }
                power.textContent = power.dataset.count;
                if (power.dataset.count < 1){
                    startCountdown(new Date().getHours() == hourRaid ? delayRaid : delay);
                }
            }
        }
    });

    /*Pour les tels*/
    document.addEventListener('touchstart', (e) => {

        if (e.target.closest('#containerBottom')) return;

        
        e.preventDefault();
         
        startTime = Date.now();
        const touch = e.touches[0];
        //Draw bubble après 0.5second
        const rect = canvas.getBoundingClientRect();
        const x = Math.floor((touch.clientX - rect.left - offsetX) / (zoomLevel * pixelSize));
        const y = Math.floor((touch.clientY - rect.top - offsetY) / (zoomLevel * pixelSize));

        const bubbleTimeout = setTimeout(() => {
            if (drag){
                if(y>=0 && x >=0 && y<=canvaSize && x <= canvaSize){
                    drawBubble(x, y);
                }
            }
        }, 500);
        
        if (e.touches.length === 2) {  // Deux doigts
            
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
        bubble.style.opacity = 0;

        const rect = canvas.getBoundingClientRect();
        const x = Math.floor((e.changedTouches[0].clientX - rect.left - offsetX) / (zoomLevel * pixelSize));
        const y = Math.floor((e.changedTouches[0].clientY - rect.top - offsetY) / (zoomLevel * pixelSize));

        if (Date.now() - startTime< 200 && e.touches.length == 1 ){//tes si : click rapide ou + de 200ms
            if (y>=0 && x >=0 && y<=canvaSize && x <= canvaSize && power.dataset.count > 0 && currentColor != pixels[y*canvaSize+x]){//} && currentColor != pixels[y*canvaSize+x].color){
  
                date = new Date();
                socket.emit('power',{x:x,y:y,color:currentColor,affiche:pseudo + ` ${date.getDate()}/${date.getMonth()+1} à ${date.getHours()}:${date.getMinutes()<10 ? "0" : ""}${date.getMinutes()}`});
                if (!admin){
                    power.dataset.count -= 1;
                }
                power.textContent = power.dataset.count;
                if (power.dataset.count < 1){
                    startCountdown(new Date().getHours() == hourRaid ? delayRaid : delay);
                }
            }
        }
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
        if(y>=0 && x >=0 && y<=canvaSize && x <= canvaSize){
            drawBubble(x, y);
        }
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

        let countdown = setInterval(() => {
            sec--;
            if (sec > -1){
            power.textContent = `${min}:${sec<10 ? 0 : ""}${sec}`;
            }
            if (sec < 0) {
                
                if (min > 0) {
                    min--;
                    sec = 59;
                    power.textContent = `${min}:${sec<10 ? 0 : ""}${sec}`;
                    
                } else {
                    power.dataset.count = new Date().getHours()==hourRaid?powerRaid:powerBase;
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
    //switch_color();
    //switch_color();
});


//<button id="changeControl">Drawing</button>
/*            <div class="imageFile-controls">
                <label for="fileimage" class="file-label" style="color:rgb(255, 255, 255);">File</label>
                <input type="file" id="fileimage" accept="image/*" style="display : none">
            </div>*/