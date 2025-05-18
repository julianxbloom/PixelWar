var express = require('express');
var router = express.Router();
var mysql = require('mysql2');
const { getCookie } = require('../public/javascripts/cookieUtils'); 
let io;
let powerBase = 7;
let delay = 10;

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

    //Pour le time du user
    socket.on('time', (data) => {
      // Mettre à jour la couleur du pixel 
      const sql = 'UPDATE user SET time = ? WHERE users = ?'
      con.query(sql, [data.time,pseudo], (err,result) => {
        if (err) {
          console.error('Erreur lors de la mise à jour du time :', err);
          return;
        }
      })
    });

    //Pour le power du user
    socket.on('power', (data) => {
      // Mettre à jour la couleur du pixel 
      const sql = 'UPDATE user SET power = ? WHERE users = ?'
      con.query(sql, [data.power,pseudo], (err,result) => {
        if (err) {
          console.error('Erreur lors de la mise à jour du power :', err);
          return;
        }
      })
    });


  });
}

// Vérification du cookie de l'utilisateur
router.get('/', function(req, res, next) {

  let pseudo = null;
  let pow = 0;

  if (getCookie("username", req) != null) {
    const sql = 'SELECT x,y,color,affiche FROM pixels';
    con.query(sql, (err, results) => {
      if (err) {
        return res.status(500).send('Erreur serveur');
      }
      pseudo = getCookie("username", req);

      con.query('SELECT power FROM user WHERE users = ?', [pseudo], function(err, result) {
        if (err) throw err;
        if (result.length != []) {
          d = Date.now();
          if(result[0].time > powerBase){
            if (d - result[0].time > 1000*delay) {
              pow = powerBase;
            }
            else {
              pow = dsec - result[0].time;
              res.cookie("power",0,{path:'/',maxAge:2*60*1000});//le cookie reste 2 min
            }
          } 
        } else {
          pow = result[0].power;
        }
      });

      return res.render('grid', { pseudo: pseudo, pixels: results, power: pow });

    });
  } else {
    return res.redirect('/login');
  }
});

module.exports = { router, setSocketIo };
