const socket = io();

//------------------Reload------------------
socket.on('reloadServeur', () => {
  window.location.reload();
});

btn = document.getElementById('BtnReload');

if (admin){
    btn.style.display = "flex";
    btn.addEventListener('click', function() {
    socket.emit("reload");
    });
}

