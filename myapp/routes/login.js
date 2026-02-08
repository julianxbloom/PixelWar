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
  host:process.env.DB_HOST,
  user:process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database:process.env.DB_NAME,
  port: 4000,
  // --- C'EST CETTE PARTIE QUI MANQUE ---
  ssl: {
    minVersion: 'TLSv1.2',
    rejectUnauthorized: true
  }

}))

// --------------------------
//   GET /login
// --------------------------
router.get('/', (req, res) => {

  const username = getCookie("username", req);
  //const username = "Tim";

  if (!username) {
    return res.render('login', { info: "Choisis ew pseudo." });
  }

  // Vérifie si pseudo existe
  con.query("SELECT users FROM user WHERE users = ?", [username], (err, result) => {
    if (err) throw err;

    if (result.length > 0) {
      // OK → connexion directe
      
      return res.redirect('/');

    }
    return res.redirect('/');

    // Le cookie existe mais le compte a disparu → on recrée automatiquement
    //con.query(
    //  "INSERT INTO user (users, googleId, power, time, popup) VALUES (?, NULL, 15, NULL, NULL)",
    //  [username],
    //  (err2) => {
    //    if (err2) throw err2;
    //    return res.redirect('/');
    //  }
    //);
  });
});

// --------------------------
//   POST /login
// --------------------------
router.post('/', (req, res) => {

  const pseudo = req.body.pseudo;
  const id = getCookie("id", req);
  //const pseudo = "Tim";

  if (!/^[A-Za-z0-9_-]{1,15}$/.test(pseudo)) {
    return res.render('login', { info: "Seules lettres, chiffres, - et _ sont autorisés." });
  }

  // Vérifie si pseudo déjà utilisé
  con.query("SELECT users FROM user WHERE users = ?", [pseudo], (err, result) => {
    if (err) throw err;

    if (result.length > 0) {
      console.log("User found");
      // Pseudo déjà existant → on connecte !
      res.cookie("username", pseudo, { path: '/', maxAge: 7*24*60*60*1000 });
      return res.redirect('/');
    }

    // Création du compte
    con.query(
      "INSERT INTO user (users, googleId, power, time, popup) VALUES (?, ?, 15, NULL, NULL)",
      [pseudo,id],
      (err2) => {
        if (err2) throw err2;

        res.cookie("username", pseudo, { path: '/', maxAge: 7*24*60*60*1000 });
        return res.redirect('/');
      }
    );
  });
});

module.exports = router;
