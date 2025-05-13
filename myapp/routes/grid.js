var express = require('express');
var router = express.Router();
var mysql = require('mysql2');
var { io } = require('../app');

// Database connection & creation
var con = mysql.createConnection({
  host: "yamanote.proxy.rlwy.net",
  port: "30831",
  database: "railway",
  user: "root",
  password: "yMdXBhOeslFOqRfhbbHUWUlijPQZtLlI"
});

con.connect(function(err) {
  if (err) throw err;
  console.log("Connected!");
});

//socket.io session
function setSocketIo(socketIo) {
  io = socketIo;

  // Configure socket.io events
  io.on('connection', (socket) => {
    console.log('A user connected');
    socket.on('pixelUpdate', (data) => {
      console.log('Pixel to update: ', data);
    });
  });
}

// Vérification du cookie de l'utilisateur
router.get('/', function(req, res, next) {
  const { getCookie } = require('../public/javascripts/cookieUtils'); 
  if (getCookie("username", req) != null) {
    const sql = 'SELECT * FROM pixels';
    con.query(sql, (err, results) => {
      if (err) {
        return res.status(500).send('Erreur serveur');
      }
      res.render('grid', { pseudo: getCookie("username", req), pixels: results });
    });
  } else {
    res.redirect('/login');
  }
});

// Requête pour colorier un pixel
router.get('/grid', (req, res) => {
  const sql = 'SELECT * FROM pixels';
  con.query(sql, (err, results) => {
    if (err) {
      return res.status(500).send('Erreur serveur');
    }
    res.render('grid', { pixels: results });
  });
});

// Modifie bdd 
// Réimporte la grid pou rtt le monde
// Lancer fct dessiner grid pour tt users*/

module.exports = { router, setSocketIo };
