var express = require('express');
var router = express.Router();
var mysql = require('mysql2');

// authentification google
const { OAuth2Client } = require('google-auth-library');
const CLIENT_ID = '435477578567-5pnm940jdum7dusda7e4vkdh495g08ls.apps.googleusercontent.com'; // client ID Google du projet
const client = new OAuth2Client(CLIENT_ID);

router.use(express.urlencoded({ extended: true }));

//Cookies pour le nbr de chg qu'un mec peut faire
const {getCookie} = require('../public/javascripts/cookieUtils');

var con = mysql.createPool({
  host: "yamanote.proxy.rlwy.net",
  port: "30831",
  database: "railway",
  user: "root",
  password: "yMdXBhOeslFOqRfhbbHUWUlijPQZtLlI"
});

router.get('/', (req, res) => {
  return res.render('login');
});

// POST request 
router.post('/', (req, res) => {

  //Verif a faire pour savoir si bon compte
  const pseudo = req.body.pseudo + req.body.CurrentClass;
  const id = getCookie("id", req);

  res.cookie("username",pseudo,{path:'/',maxAge:2*60*1000});//le cookie reste 2min

  con.query("SELECT id,users FROM user WHERE id = ?", [id], function(err, result) {
  if (err) throw err;
  if (result.length != []){
    if (result[0].users != null && result[0].users == pseudo){
      return res.redirect('/');
    }
    else if(result[0].users != pseudo){
      return res.render('/login');//,{Btn : "Mauvais pseudo"});
    }
    else {
      con.query('UPDATE INTO user (users) VALUES (?)', [pseudo], function(err,result) {
        if (err) throw err;
        return res.redirect('/');
      });
    }
  }
  });
  res.render('login');//,{Btn : "No count found"});
});

module.exports = router;
