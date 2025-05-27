const socket = io();

document.getElementById('myButton').addEventListener('click', function() {
    socket.emit("reload");
});