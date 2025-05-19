var express = require('express');
var router = express.Router();
var mysql = require('mysql2');
const { getCookie } = require('../public/javascripts/cookieUtils'); 
let io;
let powerBase = 7;
let delay = 10;
let user = {pseudo: null, power: null, time : null};

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

    //Pour le power du user
    socket.on('power', (data) => {

      if (user.power <= 0) {

          const t = user.time;
          const d = Date.now();
          if(d - t > 1000*delay){
            user.power = powerBase;
            sql = 'UPDATE user SET power = ? WHERE user = ?';
            con.query(sql,[user.power,user.pseudo], (err,result) =>{
              if (err){
                return err;
              }
            });
          }
      }

      // Mettre à jour la couleur du pixel 
      if (user.power > 0){
        sql = 'UPDATE user SET power = ? WHERE users = ?'
        con.query(sql, [user.power-1,user.pseudo], (err,result) => {
          if (err) {
            console.error('Erreur lors de la mise à jour du power :', err);
            return;
          }
        })

        user.power -=1;

        //Set time
        if (user.power == 0){
          sql = 'UPDATE user SET time = ? WHERE users = ?'
          con.query(sql, [Date.now(),user.pseudo], (err,result) => {
            if (err) {
              console.error('Erreur lors de la mise à jour du time :', err);
              return;
            }
            user.time = Date.now();
            console.log(Date.now());
          })
        } 

        //Pixel color update
        io.emit('pixelUpdate',{x:data.x,y:data.y,color:data.color,affiche:data.affiche});

        sql = 'UPDATE pixels SET color = ?, affiche = ? WHERE x = ? AND y = ?';
        const values = [data.color, data.affiche, data.x, data.y];
        con.query(sql, values, (err, result) => {
          if (err) {
            console.error('Erreur lors de la mise à jour du pixel :', err);
            return;
          }
        });

      }

    });

  });
}

// Vérification du cookie de l'utilisateur
router.get('/', function(req, res, next) {

  if (getCookie("username", req) != null) {
    const sql = 'SELECT x,y,color,affiche FROM pixels';
    con.query(sql, (err, results) => {
      if (err) {
        return res.status(500).send('Erreur serveur');
      }
      user.pseudo = getCookie("username", req);

      con.query('SELECT power,time FROM user WHERE users = ?', [user.pseudo], function(err, result) {
        if (err) throw err;
        if (result.length > 0) {

          user.time = result[0].time;

          if(result[0].power <= 0){
            const t = user.time;
            const d = Date.now();
            if(d - t > 1000*delay){
              user.power = powerBase;
              const sql = 'UPDATE user SET power = ? WHERE user = ?';
              con.query(sql,[user.power,user.pseudo], (err,result) =>{
                if (err){
                  return err;
                }
              });
            }
            else {
              user.power = 0;
            }
          } 
          else {

            user.power = result[0].power;
          }

        }

        return res.render('grid', { pseudo: user.pseudo, pixels: results, power: user.power, time : result[0].time });
      });

    });
  } else {
    return res.redirect('/login');
  }
});

module.exports = { router, setSocketIo };
