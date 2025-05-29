var express = require('express');
var router = express.Router();
var mysql = require('mysql2');
const { getCookie } = require('../public/javascripts/cookieUtils'); 
let dateRaid, delayRaid, delay, powerBase, powerRaid, gridSize;
let io;

let user = { pseudo: null, id: null, power: null, time: null, id: null, admin: false };

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
    console.log("Nouvelle connexion socket");

    con.query("SELECT timeRaid,powerBase,powerRaid,delayBase,delayRaid,gridSize FROM rules", (err, ruleRe) => {
      if (err) {
        console.error("Erreur SELECT rules :", err);
        throw err;
      }
      console.log("Règles récupérées :", ruleRe);
      if (ruleRe.length > 0) {
        let r = ruleRe[0];
        delayRaid = r.delayRaid;
        powerBase = r.powerBase;
        powerRaid = r.powerRaid;
        dateRaid = r.delayRaid;
        delay = r.delayBase;
      } else {
        delayRaid = 5;
        powerBase = 5;
        powerRaid = 3;
        dateRaid = 21;
        delay = 20;
      }
    });

    socket.on('requestSync', () => {
        con.query('SELECT x,y,color,affiche FROM pixels WHERE x < ? AND y < ?', [gridSize, gridSize], (err, results) => {
            if (err) throw err;
            if (!err) {
                socket.emit('syncPixels', results);
            }
        });
    });

    socket.on('power', (data) => {
      console.log("Événement power reçu avec data :", data);

      if (user.power <= 0) {
        const t = user.time;
        const d = Date.now();
        const time = new Date().getHours() + 2 == dateRaid ? 1000 * delayRaid : 1000 * delay;

        if (d - t > time) {
          user.power = new Date().getHours() + 2 == dateRaid ? powerRaid : powerBase;
          console.log("Power restauré :", user.power);
          sql = 'UPDATE user SET power = ? WHERE googleId = ?';
          con.query(sql, [user.power, user.id], (err, result) => {
            if (err) {
              console.error("Erreur UPDATE power :", err);
              return err;
            }
            console.log("Power mis à jour dans la BDD");
          });
        }
      }

      if (user.power > 0) {
        sql = 'UPDATE user SET power = ? WHERE googleId = ?'
        con.query(sql, [user.power - 1, user.id], (err, result) => {
          if (err) {
            console.error('Erreur lors de la mise à jour du power :', err);
            return;
          }
          console.log("Power diminué de 1 en BDD");
        });

        if (!user.admin) {
          user.power -= 1;
        }

        if (user.power == 0) {
          user.time = Date.now();
          sql = 'UPDATE user SET time = ? WHERE googleId = ?'
          con.query(sql, [Date.now(), user.id], (err, result) => {
            if (err) {
              console.error('Erreur lors de la mise à jour du time :', err);
              return;
            }
            console.log("Temps mis à jour en BDD");
          });
        }

        io.emit('pixelUpdate', { x: data.x, y: data.y, color: data.color, affiche: data.affiche });
        console.log("pixelUpdate émis via socket");

        sql = 'UPDATE pixels SET color = ?, affiche = ? WHERE x = ? AND y = ?';
        const values = [data.color, data.affiche, data.x, data.y];
        con.query(sql, values, (err, result) => {
          if (err) {
            console.error('Erreur lors de la mise à jour du pixel :', err);
            return;
          }
          console.log("Pixel mis à jour dans la BDD");
        });
      }
    });
  });
}

router.get('/', function (req, res, next) {
  console.log("GET / reçu");

  con.query("SELECT timeRaid,powerBase,powerRaid,delayBase,delayRaid,gridSize FROM rules", (err, ruleRe) => {
    if (err) {
      console.error("Erreur SELECT rules (GET /):", err);
      throw err;
    }

    console.log("Règles chargées (GET /):", ruleRe);
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

    let d = new Date();
    console.log(dateRaid,d.getHours() + 2);
    let raid = d.getHours() + 2 == dateRaid ? "en cours" : d.getHours() < dateRaid ? "auj à 21h" : "demain à 21h";

    const username = getCookie("username", req);
    const id = getCookie("id", req);
    console.log("Cookies reçus :", username, id);

    if (username != null && id != null) {
      user.id = id;
      user.pseudo = username;

      const sql = 'SELECT power,time,popup,admin,ban FROM user WHERE users = ? AND googleId = ?';
      con.query(sql, [username, id], (err, result) => {
        if (err) {
          console.error("Erreur SELECT user :", err);
          return res.status(500).send('Erreur serveur');
        }
        console.log("Utilisateur trouvé :", result);
        
        if (result.length == 0) {
          return res.redirect(`/google`);
        } else if (result[0].ban) {
          console.log("Utilisateur banni");
          con.query('SELECT time,dureeBan FROM ban WHERE users = ?', [user.pseudo], (err, resul) => {
            if (err) {
              console.error("Erreur SELECT ban :", err);
              throw err;
            }
            if (Date.now() - resul[0].time > resul[0].dureeBan || admin) {
              con.query('UPDATE user SET ban = FALSE WHERE users = ?', [user.pseudo], (err, m) => {
                if (err) throw err;
                console.log("Ban levé");
                res.redirect('/');
              });
            } else {
              return res.redirect(`/waiting?pseudo=${user.pseudo}`);
            }
          });
        } else {
          const popup = result[0].popup;
          user.admin = result[0].admin;
          con.query('SELECT maintenance FROM global WHERE id = 1', (err, r) => {
            if (err) {
              console.error("Erreur SELECT maintenance :", err);
              throw err;
            }
            if (r.length > 0 && r[0].maintenance && !user.admin) {
              return res.redirect(`/waiting?pseudo=${user.pseudo}`);
            } else {
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

                console.log("Pixels récupérés :", results.length);
                user.time = result[0].time;

                if (result[0].power <= 0) {
                  const t = user.time;
                  const d = Date.now();
                  if (d - t > 1000 * delay) {
                    user.power = powerBase;
                    const sql = 'UPDATE user SET power = ? WHERE googleId = ?';
                    con.query(sql, [user.power, user.id], (err, m) => {
                      if (err) {
                        console.error("Erreur UPDATE power 0 -> base :", err);
                        return err;
                      }
                      console.log("Power restauré à base");
                    });
                  } else {
                    user.power = 0;
                  }
                } else {
                  user.power = result[0].power;
                }

                console.log("Render de la grille",delay,popup);
                return res.render('grid', {
                  pseudo: user.pseudo,
                  pixels: results,
                  power: user.power,
                  time: Date.now() - user.time,
                  popup: popup,
                  nextRaid: raid,
                  verifP: user.admin,
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
      console.log("Redirection vers /google car pas de cookie");
      return res.redirect('/google');
    }
  });
});

module.exports = { router, setSocketIo };
