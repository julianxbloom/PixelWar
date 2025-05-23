var express = require('express');
var router = express.Router();
var mysql = require('mysql2');
const { getCookie } = require('../public/javascripts/cookieUtils'); 
//const { get } = require('./google');
let io;
let powerBase = 7;
let gridSize = 40;
let delay = 5;

// Date for raid
let d = new Date();
let raid = d.getHours == 18? "en cours" : d.getHours() < 18 ? "auj à 18h" : "demain à 18h";

let user = {pseudo: null,id:null, power: null, time : null, id:null};
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
            sql = 'UPDATE user SET power = ? WHERE googleId = ?';
            con.query(sql,[user.power,user.id], (err,result) =>{
              if (err){
                return err;
              }
            });
          }
      }

      // Mettre à jour la couleur du pixel 
      if (user.power > 0){
        sql = 'UPDATE user SET power = ? WHERE googleId = ?'
        con.query(sql, [user.power-1,user.id], (err,result) => {
          if (err) {
            console.error('Erreur lors de la mise à jour du power :', err);
            return;
          }
        });

        user.power -=1;

        //Set time
        if (user.power == 0){
          sql = 'UPDATE user SET time = ? WHERE googleId = ?'
          con.query(sql, [Date.now(),user.id], (err,result) => {
            if (err) {
              console.error('Erreur lors de la mise à jour du time :', err);
              return;
            }
            user.time = Date.now();
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
  const username = getCookie("username", req);
  const id = getCookie("id", req);

  if (username != null && id != null) {
    user.id = id;
    user.pseudo = username;
    // Vérification de l'existence de l'utilisateur dans la base de données
    const sql = 'SELECT power,time,popup FROM user WHERE users = ? AND googleId = ?';
    con.query(sql, [username, id], (err, result) => {
      if (err) {
        return res.status(500).send('Erreur serveur');
      }
      if (result.length == 0) {
        return res.redirect('/google');
      }
      else{
      con.query('UPDATE user SET popup = NULL WHERE googleId = ?', [user.id], (err, result) => {
        if (err) throw err;});
      con.query('SELECT x,y,color,affiche FROM pixels WHERE x < ? AND y < ?',[gridSize,gridSize], (err, results) => {
        if (err) {
        return res.status(500).send('Erreur serveur');}

        user.time = result[0].time;

        if(result[0].power <= 0){
          const t = user.time;
          const d = Date.now();
          if(d - t > 1000*delay){
            user.power = powerBase;
            const sql = 'UPDATE user SET power = ? WHERE googleId = ?';
            con.query(sql,[user.power,user.id], (err,result) =>{
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
        return res.render('grid', { pseudo: user.pseudo, pixels: results, power: user.power, time : Date.now() - user.time, popup:result[0].popup, nextRaid:raid});
          });  
        }
      });
  }
  else {
    return res.redirect('/google');
  }
});

module.exports = { router, setSocketIo };
