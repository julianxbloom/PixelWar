var express = require('express');
var router = express.Router();
var mysql = require('mysql2');

// authentification google
const { OAuth2Client } = require('google-auth-library');
const CLIENT_ID = '435477578567-5pnm940jdum7dusda7e4vkdh495g08ls.apps.googleusercontent.com'; // client ID Google du projet
const client = new OAuth2Client(CLIENT_ID);

router.use(express.urlencoded({ extended: true }));


var con = mysql.createPool({
  host: "yamanote.proxy.rlwy.net",
  port: "30831",
  database: "railway",
  user: "root",
  password: "yMdXBhOeslFOqRfhbbHUWUlijPQZtLlI"
});

router.get('/', (req, res) => {
    return res.render('google',{info:""});
});

router.post('/', async (req, res) => {
    console.log("Google login attempt");
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
          console.log("Erreur de connexion à la base de données",err);
          return res.json({ success: false })};
        if (result.length == 0) {
          // Crée un nouvel utilisateur
          con.query('INSERT INTO user (googleId,users, power, time,popup) VALUES (?, ?, ?, ?,?)', [googleId,null, 7, null,null], (err2) => {
            if (err2) {
              console.log("Erreur de connexion à la base de données", err2);
              return res.json({ success: false })};
            console.log("1er cas");
            res.cookie("id", googleId, { path: '/', maxAge: 24*60*60*1000, httpOnly: false });
            return res.json({ success: true });
          });
        } else {
          // Utilisateur déjà existant
          console.log("2e cas");
          res.cookie("id", googleId, { path: '/', maxAge: 24*60*60*1000, httpOnly: false });
          return res.json({ success: true });
        }
      });
    } catch (e) {
      return res.json({ success: false });
    }
});

module.exports = router;