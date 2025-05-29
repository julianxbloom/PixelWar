var express = require('express');
var router = express.Router();
var mysql = require('mysql2');
const { getCookie } = require('../public/javascripts/cookieUtils'); 
//const { get } = require('./google');
let io;
let powerBase = 5;
let powerRaid = 3;
let gridSize = 40;

let user = {pseudo: null,id:null, power: null, time : null, id:null,admin:false};
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

    let delayRaid = 10;
    let delay = 1;
    let powerBase = 5;
    let dateRaid = 21;

    //Pour le power du user
    socket.on('power', (data) => {

      if (user.power <= 0) {

          const t = user.time;
          const d = Date.now();
          const time = new Date().getHours()+2==dateRaid? 1000*delayRaid:1000*delay;

          if(d - t > time){
            user.power = new Date().getHours()+2==dateRaid ? user.power = powerRaid: user.power = powerBase;
            
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

        if(!user.admin){
          user.power -=1;
        }

        //Set time
        if (user.power == 0){
          user.time = Date.now();
          sql = 'UPDATE user SET time = ? WHERE googleId = ?'
          con.query(sql, [Date.now(),user.id], (err,result) => {
            if (err) {
              console.error('Erreur lors de la mise à jour du time :', err);
              return;
            }
            
          });
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

  // Date for raid
  let dateRaid = 21;
  let delay = 1;

  let d = new Date();
  let raid = d.getHours()+2 == dateRaid? "en cours" : d.getHours() < dateRaid ? "auj à 21h" : "demain à 21h";
  
  const username = getCookie("username", req);
  const id = getCookie("id", req);
  
  if (username != null && id != null) {
    user.id = id;
    user.pseudo = username;
    // Vérification de l'existence de l'utilisateur dans la base de données
    const sql = 'SELECT power,time,popup,admin,ban FROM user WHERE users = ? AND googleId = ?';
    con.query(sql, [username, id], (err, result) => {
      if (err) {
        return res.status(500).send('Erreur serveur');
      }
      if (result.length == 0 ) {
        return res.redirect(`/google`);
      }

      else if(result[0].ban){
        con.query('SELECT time,dureeBan FROM ban WHERE users = ?',[user.pseudo],(err,resul)=>{
          if (err) throw err;
          if(Date.now()-resul[0].time > resul[0].dureeBan || admin){
            con.query('UPDATE user SET ban = FALSE WHERE users = ?',[user.pseudo],(err,resul)=>{
              if(err) throw err;
              res.redirect('/');
            });
          }
          else{
            return res.redirect(`/waiting?pseudo=${user.pseudo}`);
          }
        });
        
      }
      else{
        user.admin = result[0].admin;
        
        con.query('SELECT maintenance FROM global WHERE id = 1', (err, r) => {
          if (err) throw err;
          if (r.length > 0 && r[0].maintenance && !user.admin) {
            return res.redirect(`/waiting?pseudo=${user.pseudo}`);
          }
          else{
              con.query('UPDATE user SET popup = NULL WHERE googleId = ?', [user.id], (err, rer) => {
                if (err) throw err;});
              con.query('SELECT x,y,color,affiche FROM pixels WHERE x < ? AND y < ?',[gridSize,gridSize], (err, results) => {
                if (err) {
                return res.status(500).send('Erreur serveur');
                }

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

                return res.render('grid', { pseudo: user.pseudo, pixels: results, power: user.power, time : Date.now() - user.time, popup:result[0].popup, nextRaid:raid,verifP : user.admin});
              });  
            }
        });
      }
    });
  }
  else {
    return res.redirect('/google');
  }

});

module.exports = { router, setSocketIo };