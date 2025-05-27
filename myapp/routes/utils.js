var express = require('express');
var router = express.Router();

let pseudo = false;

// Permet d'injecter io depuis le serveur principal
function setSocketIo(socketIo) {
    io = socketIo;

    io.on('connection', (socket) => {
        if (pseudo){
        socket.on('reload', () => {
            io.emit('reloadServeur');
        });
    }
    });
}

/* GET home page. */
router.get('/', function(req, res, next) {
    pseudo = req.query.pseudo; // Récupère la variable pseudo de l'URL
    pseudo = pseudo=="timTG01";
    return res.render('utils', { pseudo }); // Passe-la à la vue si besoin
});

module.exports = { router, setSocketIo };