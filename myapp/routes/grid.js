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


//Vérification du cookie de l'utilisateur
router.get('/', function(req, res, next) {
  //Cookies pour le nbr de chg qu'un mec peut faire
  const {getCookie} = require('../public/javascripts/cookieUtils'); 
  if (getCookie("username",req) != null){
    //Requete bdd
    const sql = 'SELECT * FROM pixels';
    con.query(sql, (err, results) => {
      if (err) {
        return res.status(500).send('Erreur serveur');
      }
      res.render('grid', {pseudo : getCookie("username",req), pixels: results }); // Renvoie une page avec les données
    });
  }
  else{
    res.redirect('/login');
  }
});

//requete colori pixel
router.get('/grid', (req, res) => {
  //Requete bdd
  const sql = 'SELECT * FROM pixels';
  con.query(sql, (err, results) => {
    if (err) {
      return res.status(500).send('Erreur serveur');
    }
    res.render('grid', { pixels: results }); // Renvoie une page avec les données
  });
});


//socket.io session
var io = require('socket.io')(http);
io.on('connection', (socket) => {
  socket.on('chat message', (msg) => {
    console.log('message: ' + msg);
});});

// Modifie bdd 
// Réimporte la grid pou rtt le monde
// Lancer fct dessiner grid pour tt users

module.exports = router;
