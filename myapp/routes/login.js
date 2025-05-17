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
 

/* GET request */
router.get('/', (req, res) => {
  
  con.query("SELECT * FROM user WHERE users = ?", [getCookie("username", req)], function(err, result) {
    if (err) throw err;
    console.log(result);
  });

  if (getCookie("username",req) in ["JulianTG01"]){
    if (!getCookie("power",req)){
      res.cookie("power",0,{path:'/',maxAge:2*60*1000});
    }
    res.redirect('/');
  }
  else {
    res.render('login',{Btn : "Tu n'es pas connecté"});
  }
});

/* POST request */
router.post('/', (req, res) => {

  //Verif a faire pour savoir si bon compte
  const pseudo = req.body.pseudo + req.body.CurrentClass;

  var con = mysql.createPool({
    host: "yamanote.proxy.rlwy.net",
    port: "30831",
    database: "railway",
    user: "root",
    password: "yMdXBhOeslFOqRfhbbHUWUlijPQZtLlI"
  });
  con.query("SELECT * FROM user WHERE users = ?", [pseudo], function(err, result) {
    if (err) throw err;
    console.log(result);
  });

  if (getCookie("username",req) in ["JulianTG01"]){
    if (!getCookie("power",req)){
      res.cookie("power",0,{path:'/',maxAge:2*60*1000});
    }
    res.redirect('/');
  }

  else if (pseudo == "JulianTG01"){

    if (!getCookie("power",req) || !getCookie("username",req)){
      res.cookie("power",7,{path:'/',maxAge:2*60*1000});//le cookie reste 1 semaine
      res.cookie("username",pseudo,{path:'/',maxAge:2*60*1000});//le cookie reste 1 semaine
    }

    res.redirect('/');
  }

  else {
    res.render('login',{Btn : "Wrong pseudo,Retry"});
  }
});

module.exports = router;
