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
    socket.on('dataPixel', (data) => {  
      const sql = 'UPDATE pixels SET color = ? WHERE x = ? AND y = ?';
      const values = [data.color, data.x, data.y];
      con.query(sql, values, (err, result) => {
        if (err) {
          console.error('Erreur lors de la mise à jour du pixel :', err);
          return;
        }
        console.log('Pixel mis à jour avec succès !');
      });
      socket.emit('pixelUpdate',{x:data.x,y:data.y,color:data.color});
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
