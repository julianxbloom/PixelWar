var express = require('express');
var router = express.Router();

let io = null; // Stockera l'instance io

// Permet d'injecter io depuis le serveur principal
function setSocketIo(socketIo) {
    io = socketIo;

    io.on('connection', (socket) => {
        socket.on('reload', () => {
            io.emit('reloadServeur');
        });
    });
}

/* GET home page. */
router.get('/', function(req, res, next) {
    return res.render('utils');
});

module.exports = { router, setSocketIo };