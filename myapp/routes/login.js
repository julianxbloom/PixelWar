var express = require('express');
var router = express.Router();
var mysql = require('mysql2');

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

  con.query("SELECT * FROM user WHERE users = ?", [getCookie("username", req)], function(err, result) {
    if (err) throw err;
    if (result.length == []){
      return res.render('login',{Btn : "Tu n'es pas connecté"});
    }

  });
});

/* POST request */
router.post('/', (req, res) => {

  //Verif a faire pour savoir si bon compte
  const pseudo = req.body.pseudo + req.body.CurrentClass;

  if (!getCookie("username",req)){
    res.cookie("username",pseudo,{path:'/',maxAge:2*60*1000});//le cookie reste 2min
  }

  con.query("SELECT power FROM user WHERE users = ?", [pseudo], function(err, result) {
  if (err) throw err;
  if (result.length != []){
    if(!getCookie("power",req)){
      res.cookie("power",result[0].power,{path:'/',maxAge:2*60*1000});//le cookie reste 2 min
    }
    return res.redirect('/');
  }
  else {
    con.query('INSERT INTO user (users,power,time) VALUES (?,?,?)', [pseudo, 7, null], function(err,result) {
      if (err) throw err;
      return res.redirect('/');
    });
  }
  });

  //res.render('login',{Btn : "Wrong pseudo,Retry"});

});

module.exports = router;
