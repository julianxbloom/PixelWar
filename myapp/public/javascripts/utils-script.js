const socket = io();

//------------------Reload------------------
socket.on('reloadServeur', () => {
  window.location.reload();
});

document.getElementById('BtnReload').addEventListener('click', function() {
    console.log("Reloading server...");
    socket.emit("reload");
});