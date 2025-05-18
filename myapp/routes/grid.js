var express = require('express');
var router = express.Router();
var mysql = require('mysql2');
let io;

// Database connection & creation
var con = mysql.createPool({
  host: "yamanote.proxy.rlwy.net",
  port: "30831",
  database: "railway",
  user: "root",
  password: "yMdXBhOeslFOqRfhbbHUWUlijPQZtLlI"
});


//socket.io session
function setSocketIo(socketIo) {
  io = socketIo;

  // Configure socket.io events
  io.on('connection', (socket) => {
    socket.on('dataPixel', (data) => {  

      //Pixel color update
      io.emit('pixelUpdate',{x:data.x,y:data.y,color:data.color,affiche:data.affiche});

      const sql = 'UPDATE pixels SET color = ?, affiche = ? WHERE x = ? AND y = ?';
      const values = [data.color, data.affiche, data.x, data.y];
      con.query(sql, values, (err, result) => {
        if (err) {
          console.error('Erreur lors de la mise à jour du pixel :', err);
          return;
        }
      });
    });
  });
}

// Vérification du cookie de l'utilisateur
router.get('/', function(req, res, next) {
  const { getCookie } = require('../public/javascripts/cookieUtils'); 
  if (getCookie("username", req) != null) {
    const sql = 'SELECT x,y,color,affiche FROM pixels';
    con.query(sql, (err, results) => {
      if (err) {
        return res.status(500).send('Erreur serveur');
      }
      return res.render('grid', { pseudo: getCookie("username", req), pixels: results });
    });
  } else {
    return res.redirect('/login');
  }
});

// Requête pour colorier un pixel
/*
router.get('/grid', (req, res) => {
  const sql = 'SELECT * FROM pixels';
  con.query(sql, (err, results) => {
    if (err) {
      return res.status(500).send('Erreur serveur');
    }
    return res.render('grid', { pixels: results });
  });
});
*/

module.exports = { router, setSocketIo };
