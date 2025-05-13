var express = require('express');
var router = express.Router();
var mysql = require('mysql2');
var app = require('../app');


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

// Requête colori pixel
router.get('/grid', (req, res) => {
  const sql = 'SELECT * FROM pixels';
  con.query(sql, (err, results) => {
    if (err) {
      return res.status(500).send('Erreur serveur');
    }
    res.render('grid', { pixels: results });
  });
});



/*io.on('connection', (socket) => {
  console.log('Un utilisateur est connecté');
  /*socket.on('pixelUpdate', (data) => {
      console.log('Pixel mis à jour :', data);
  });*/

/*socket.io session
var http = require('http');
var socketIo = require('socket.io');
// à modifier

io.on('connection', (socket) => {
  socket.on('pixelUpdate', (msg) => {
    console.log('pixel à modif: ' + msg);
});});



// Modifie bdd 
// Réimporte la grid pou rtt le monde
// Lancer fct dessiner grid pour tt users*/

module.exports = router;
