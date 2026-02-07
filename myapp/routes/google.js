var express = require('express');
var router = express.Router();
var mysql = require('mysql2');
require("dotenv").config();

// authentification google
const { OAuth2Client } = require('google-auth-library');
const CLIENT_ID = '435477578567-5pnm940jdum7dusda7e4vkdh495g08ls.apps.googleusercontent.com'; // client ID Google du projet
const client = new OAuth2Client(CLIENT_ID);

router.use(express.urlencoded({ extended: true }));


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

router.get('/', (req, res) => {
  
    return res.render('google',{info:""});
});

router.post('/', async (req, res) => {
    const { id_token } = req.body;
    try {
      const ticket = await client.verifyIdToken({
        idToken: id_token,
        audience: CLIENT_ID,
      });
      const payload = ticket.getPayload();
      const googleId = payload['sub'];
    
      // Vérifie si l'utilisateur existe déjà
      con.query('SELECT * FROM user WHERE googleId = ?', [googleId], (err, result) => {
        if (err) {
          return res.json({ success: false })};
        if (result.length == 0) {
          // Crée un nouvel utilisateur
          con.query('INSERT INTO user (googleId,users, power, time,popup) VALUES (?, ?, ?, ?,?)', [googleId,null, 15, null,null], (err2) => {
            if (err2) {
              return res.json({ success: false })};
            res.cookie("id", googleId, { path: '/', maxAge: 7*24*60*60*1000, httpOnly: false });
            return res.json({ success: true });
          });
        } else {
          // Utilisateur déjà existant
          res.cookie("id", googleId, { path: '/', maxAge: 7*24*60*60*1000, httpOnly: false });
          return res.json({ success: true });
        }
      });
    } catch (e) {
      return res.json({ success: false });
    }
});

module.exports = router;