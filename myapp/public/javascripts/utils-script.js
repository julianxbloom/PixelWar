const socket = io();

//------------------Reload------------------
socket.on('reloadServeur', () => {
  window.location.reload();
});

btn = document.getElementById('BtnReload');

if (pseudo){
    btn.addEventListener('click', function() {
    socket.emit("reload");
    });
}
else{
    btn.style.display = "none";
}

