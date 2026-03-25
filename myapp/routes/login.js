var express = require('express');
var router = express.Router();
var mysql = require('mysql2');

// Cookies
const { getCookie } = require('../public/javascripts/cookieUtils');

require("dotenv").config();

//var con = mysql.createPool({
//  host: "localhost",
//  user: "devuser",
//  password: "monpassword",
//  database: "pixelwar"
//});

var con = mysql.createPool(({
  host:process.env.MYSQLHOST,
  user:process.env.MYSQLUSER,
  password: process.env.MYSQLPASSWORD,
  database:process.env.MYSQLDATABASE,
  port: process.env.MYSQLPORT,
  // --- C'EST CETTE PARTIE QUI MANQUE ---
  ssl: {
    minVersion: 'TLSv1.2',
    rejectUnauthorized: false
  }

}))

// --------------------------
//   GET /login
// --------------------------
router.get('/', (req, res) => {

  const username = getCookie("username", req);
  const id = getCookie("id",req);
  //const username = "Tim";

  if(!id){
    return res.redirect('/google');
  }
  else if (!username) {
    return res.render('login', { info: "Tu peux revenir au menu pour voir les équipes déja créées." });
  }

  // Vérifie si pseudo existe
  con.query("SELECT users FROM user WHERE users = ?", [username], (err, result) => {
    if (err) throw err;

    if (result.length > 0) {
      // OK → connexion directe
      
      return res.redirect('/grid');

    }
    else {
      //Utilisateur existe pas
      res.clearCookie("username");
      return res.render('login', { info: "Tu peux revenir au menu pour voir les équipes déja créées." });
    }

  });
});

// --------------------------
//   POST /login
// --------------------------
router.post('/', (req, res) => {

  const pseudo = req.body.pseudo;
  let team_up = req.body.team
  let team = team_up;
  try {
    team = team_up.toLowerCase();
  }
  catch(error){
    team = team_up;
  }

  const id = getCookie("id", req);

  if(!id){

    res.clearCookie("username",{path: '/'});
    return res.redirect('/');
  }

  //const pseudo = "Tim";

  if (!/^[A-Za-z0-9_-]{1,15}$/.test(pseudo)) {
    return res.render('login', { info: "Seules lettres, chiffres, - et _ sont autorisés pour le pseudo." });
  }

  // Vérifie si pseudo déjà utilisé
  con.query("SELECT googleId,users FROM user WHERE users = ? ", [pseudo], (err, result) => {
    if (err) throw err;

    if (result.length > 0) {
      console.log("User found");
      if (result.googleId != id){
        return res.render('login', { info: "Pseudo déjà pris !" });
      }
      else{
        // Pseudo déjà existant → on connecte !
        res.cookie("username", pseudo, { path: '/', maxAge: 7*24*60*60*1000 });
        return res.redirect('/grid');
      }
    }

    con.query("SELECT googleId FROM user WHERE googleId = ?",[id],(err,result)=>{
      if(err) throw err;

      if (result.length>0){

        con.query("INSERT INTO team (name) SELECT ? WHERE NOT EXISTS (SELECT name FROM team WHERE name = ?)",[team,team],(err,resul)=>{
          if (err) throw err;

          con.query("UPDATE user SET users = ?,team = ? WHERE googleId = ? ",[pseudo,team,id],(err,resultat)=>{
            if(err) throw err;
            res.cookie("username", pseudo, { path: '/', maxAge: 7*24*60*60*1000 });
            return res.redirect('/grid');
          });

        });
      }

      else{
        res.clearCookie('id');
        return res.redirect('/google');
      }
    })

  });
});

module.exports = router;
