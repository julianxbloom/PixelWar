var express = require('express');
var router = express.Router();
var mysql = require('mysql2');
const { getCookie } = require('../public/javascripts/cookieUtils'); 
let dateRaid, delayRaid, delay, powerBase, powerRaid, gridSize;
let io;

var con = mysql.createPool({
  host: "yamanote.proxy.rlwy.net",
  port: "30831",
  database: "railway",
  user: "root",
  password: "yMdXBhOeslFOqRfhbbHUWUlijPQZtLlI"
});

function setSocketIo(socketIo) {
  io = socketIo;
  io.on('connection', (socket) => {

    const rawCookies = socket.handshake.headers.cookie;

    // Parser le cookie manuellement
    const cookies = {};
    rawCookies?.split(';').forEach(cookie => {
      const [name, value] = cookie.trim().split('=');
      cookies[name] = decodeURIComponent(value);
    });

    let user = { pseudo: null, id: null, power: null, time: null, admin: false, nbrColor : 0 };
    user.pseudo = cookies.username;
    user.id = cookies.id;
    user.power = cookies.power;
    user.admin = Boolean(Number(cookies.admin));
    console.log("connection",user.power);

    con.query("SELECT timeRaid,powerBase,powerRaid,delayBase,delayRaid,gridSize FROM rules", (err, ruleRe) => {
      if (err) {
        console.error("Erreur SELECT rules :", err);
        throw err;
      }
      if (ruleRe.length > 0) {
        let r = ruleRe[0];
        delayRaid = r.delayRaid;
        powerBase = r.powerBase;
        powerRaid = r.powerRaid;
        dateRaid = r.timeRaid;
        delay = r.delayBase;
      } else {
        delayRaid = 5;
        powerBase = 5;
        powerRaid = 3;
        dateRaid = 21;
        delay = 20;
      }
    });

    //con.query("SELECT timeRaid,powerBase,powerRaid,delayBase,delayRaid,gridSize FROM rules", (err, ruleRe) => {

    socket.on('requestSync', () => {
        con.query('SELECT x,y,color,affiche FROM pixels WHERE x < ? AND y < ?', [gridSize, gridSize], (err, results) => {
            if (err) throw err;
            if (!err) {
                socket.emit('syncPixels', results);
            }
        });
    });

    socket.on('requestPower', (data) => {
      const sql = 'SELECT power, time FROM user WHERE googleId = ?';
      con.query(sql, [user.id], (err, result) => {
        if (err) {
          console.error("Erreur SELECT user :", err);
          return;
        }
        if (result.length > 0) {
          if (result[0].power <= 0){
            if (Date.now() - result[0].time > (new Date().getHours() +2 == dateRaid ? 1000 * delayRaid : 1000*delay)){
              user.power = new Date().getHours() + 2 == dateRaid ? powerRaid : powerBase;

              socket.emit('powerCookie', { power: user.power});

              sql = 'UPDATE user SET power = ? WHERE googleId = ?';
              con.query(sql, [user.power, user.id], (err, m) => {
                if (err) {
                  console.error("Erreur UPDATE power :", err);
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
          res.cookie("power",user.power,{path:'/',maxAge:7*24*60*60*1000});//le cookie reste 2min
          user.time = result[0].time;
          socket.emit('powerUpdate', { power: user.power, time: Date.now() - user.time});
        }
      });
      }
    );

    socket.on('power', (data) => {
      console.log(user.power,"power");
      if (user.power <= 0) {
        const sql = 'SELECT time FROM user WHERE googleId = ?';
        con.query(sql, [user.id], (err, result) => {
          if (err) {
            console.error("Erreur SELECT user :", err);
            return;
          }
          if (result.length > 0) {
            user.time = result[0].time;
            console.log(user.power,"user power");
            console.log("reimporte");
          }
        });
        
        const t = user.time;
        const d = Date.now();
        console.log(d-t);
        console.log(new Date().getHours() +2 == dateRaid ? 1000*delayRaid : 100*delay,"delay");
        console.log(new Date().getHours() +2,"H", dateRaid,delayRaid,delay);
        /*console.log(user.time,d);
        console.log(new Date().getHours(),"H");
        console.log("sous",d-t,(new Date().getHours() +2 == dateRaid ? 1000 * delayRaid : 1000*delay),(d-t)-(new Date().getHours() +2 == dateRaid ? 1000 * delayRaid : 1000*delay));
*/
        if (d - t > (new Date().getHours() +2 == dateRaid ? 1000 * delayRaid : 1000*delay)) {
          console.log("donne");
          user.power = new Date().getHours() +2 == dateRaid ?powerRaid : powerBase;
          con.query('UPDATE user SET power = ? WHERE googleId = ?', [user.power, user.id], (err, result) => {
            if (err) {
              console.error("Erreur UPDATE power :", err);
              return err;
            }
          });
        }
      } //

      con.query('SELECT power FROM user WHERE googleId = ?', [user.id], (err, result) => {
        if (err) {
          console.error("Erreur SELECT user :", err);
          return;
        }
        if (result.length > 0) {
          user.power = result[0].power;
          console.log(user.power,"user power");
        }
      });

      if (user.power > 0) {

        if (!user.admin) {
          console.log("-1 au power");
          user.power -= 1;
          user.nbrColor += 1;

          //Updtae le nombre de cases colorié par la personne
          con.query('SELECT nbrColor FROM user WHERE googleId = ?',[user.id],(err,rep)=> {
            if (err) throw err;
            if (rep.length > 0){
              con.query('UPDATE user SET power = ?, nbrColor = ? WHERE googleId = ?',[user.power,rep[0].nbrColor+1,user.id] ,(err,m) =>{
                if (err) throw err;
              });
            }
          });

          //Emit le cookie pour qu'il soit update
          console.log(user.power,"chg power 2")
        }

        if (user.power == 0) {
          user.time = Date.now();
          sql = 'UPDATE user SET time = ? WHERE googleId = ?'
          con.query(sql, [Date.now(), user.id], (err, m) => {
            if (err) {
              console.error('Erreur lors de la mise à jour du time :', err);
              return;
            }
          });
        }
        
        //emit cookie pour qu'il soit update
        socket.emit('powerCookie', { power: user.power});
        console.log(user.power,"chg power end");
        io.emit("pixelUpdate",{x:data.x,y:data.y,color:data.color,affiche:data.affiche});
        sql = 'UPDATE pixels SET color = ?, affiche = ? WHERE x = ? AND y = ?';
        const values = [data.color, data.affiche, data.x, data.y];
        con.query(sql, values, (err, m) => {
          if (err) {
            console.error('Erreur lors de la mise à jour du pixel :', err);
            return;
          }
        });
      }

    });
    
    if (user.admin){
        socket.on('reload', () => {
            io.emit('reloadServeur');
        });
    }
  });
}

router.get('/', function (req, res, next) {

  con.query("SELECT timeRaid,powerBase,powerRaid,delayBase,delayRaid,gridSize FROM rules", (err, ruleRe) => {
    if (err) {
      console.error("Erreur SELECT rules (GET /):", err);
      throw err;
    }

    if (ruleRe.length > 0) {
      let r = ruleRe[0];
      dateRaid = r.timeRaid;
      delayRaid = r.delayRaid;
      delay = r.delayBase;
      powerBase = r.powerBase;
      powerRaid = r.powerRaid;
      gridSize = r.gridSize;
    } else {
      dateRaid = 21;
      delayRaid = 5 * 60;
      delay = 20 * 60;
      powerBase = 5;
      powerRaid = 3;
      gridSize = 50;
    }
    
    let user = { pseudo: null, id: null, power: null, time: null, admin: false, nbrColor : 0 };
    let d = new Date();
    let raid = d.getHours() + 2 == dateRaid ? "en cours" : d.getHours() +2< dateRaid ? "auj à 21h" : "demain à 21h";

    const username = getCookie("username", req);
    const id = getCookie("id", req);

    if (username != null && id != null) {
      user.id = id;
      user.pseudo = username;

      const sql = 'SELECT power,time,popup,admin,ban, nbrColor FROM user WHERE users = ? AND googleId = ?';
      con.query(sql, [username, id], (err, result) => {
        if (err) {
          console.error("Erreur SELECT user :", err);
          return res.status(500).send('Erreur serveur');
        }
        
        if (result.length == 0) {
          return res.redirect(`/google`);
        } else if (result[0].ban) {
          con.query('SELECT time,dureeBan FROM ban WHERE users = ?', [user.pseudo], (err, resul) => {
            if (err) {
              console.error("Erreur SELECT ban :", err);
              throw err;
            }
            if (Date.now() - resul[0].time > resul[0].dureeBan || result[0].admin) {
              con.query('UPDATE user SET ban = FALSE WHERE users = ?', [user.pseudo], (err, m) => {
                if (err) throw err;
                res.redirect('/');
              });
            } else {
              return res.redirect(`/waiting?pseudo=${user.pseudo}`);
            }
          });
        } else {
          const popup = result[0].popup;
          user.admin = result[0].admin;
          user.nbrColor = result[0].nbrColor;
          con.query('SELECT maintenance FROM global WHERE id = 1', (err, r) => {
            if (err) {
              console.error("Erreur SELECT maintenance :", err);
              throw err;
            }
            if (r.length > 0 && r[0].maintenance && !user.admin) {
              return res.redirect(`/waiting?pseudo=${user.pseudo}`);
            /*if (r.length > 0){ //}} */}else {
              con.query('UPDATE user SET popup = NULL WHERE googleId = ?', [user.id], (err, rer) => {
                if (err) {
                  console.error("Erreur UPDATE popup :", err);
                  throw err;
                }
              });

              con.query('SELECT x,y,color,affiche FROM pixels WHERE x < ? AND y < ?', [gridSize, gridSize], (err, results) => {
                if (err) {
                  console.error("Erreur SELECT pixels :", err);
                  return res.status(500).send('Erreur serveur');
                }

                user.time = result[0].time;

                if (result[0].power <= 0) {
                  const t = user.time;
                  const d = Date.now();
                  console.log("reload",t,d,(new Date().getHours() +2 == dateRaid ? 1000 * delayRaid : 1000*delay),(d-t)-(new Date().getHours() +2 == dateRaid ? 1000 * delayRaid : 1000*delay))
                  if (d - t > (new Date().getHours() +2 == dateRaid ? 1000 * delayRaid : 1000*delay)) {
                    user.power = new Date().getHours() +2 == dateRaid ?powerRaid : powerBase;
                    const sql = 'UPDATE user SET power = ? WHERE googleId = ?';
                    con.query(sql, [user.power, user.id], (err, m) => {
                      if (err) {
                        console.error("Erreur UPDATE power 0 -> base :", err);
                        return err;
                      }
                    });
                  } else {
                    user.power = 0;
                  }
                } else {
                  user.power = result[0].power;
                }

              con.query('SELECT admin FROM user WHERE users = ?', [req.query.pseudo], (err, result) => {
                if (err) {
                  return res.status(500).send('Erreur serveur');
                }
                if (result.length > 0){
                  admin = result[0].admin;
                  return res.render('utils', {admin:admin}); // Passe-la à la vue si besoin
                }
              });
              console.log(user.power,"res.get");
                res.cookie("power",user.power,{path:'/',maxAge:7*24*60*60*1000});//le cookie reste 2min
                res.cookie("admin",user.admin,{path:'/',maxAge:7*24*60*60*1000});//le cookie reste 2min
                return res.render('grid', {
                  pseudo: user.pseudo,
                  admin: user.admin,
                  pixels: results,
                  power: user.power,
                  time: Date.now() - user.time,
                  popup: popup,
                  nextRaid: raid,
                  gridSize: gridSize,
                  powerBase: powerBase,
                  powerRaid: powerRaid,
                  hourRaid: dateRaid,
                  delay: delay,
                  delayRaid: delayRaid
                });
              });
            }
          });
        }
      });
    } else {
      return res.redirect('/google');
    }
  });
});

module.exports = { router, setSocketIo };
