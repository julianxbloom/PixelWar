var express = require('express');
var router = express.Router();
var mysql = require('mysql2');

// Database connection & creation
var con = mysql.createPool({
  host: "yamanote.proxy.rlwy.net",
  port: "30831",
  database: "railway",
  user: "root",
  password: "yMdXBhOeslFOqRfhbbHUWUlijPQZtLlI"
});

let admin = false;

// Permet d'injecter io depuis le serveur principal
function setSocketIo(socketIo) {
    io = socketIo;

    io.on('connection', (socket) => {
        if (admin){
        socket.on('reload', () => {
            io.emit('reloadServeur');
        });
    }
    });
}

/* GET home page. */
router.get('/', function(req, res, next) {
    const sql = 'SELECT admin FROM user WHERE users = ?';
    con.query(sql, [req.query.pseudo], (err, result) => {
      if (err) {
        return res.status(500).send('Erreur serveur');
      }
      if (result.length > 0){
        admin = result[0].admin;
        return res.render('utils', {admin:admin}); // Passe-la à la vue si besoin
      }
    });
});

module.exports = { router, setSocketIo };