var express = require('express');
var router = express.Router();
var mysql = require('mysql2');

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
  if (getCookie("id", req) != null){
  return res.render('login');
  }
  else {
    return res.redirect('/google');
  }
});

// POST request 
router.post('/', (req, res) => {

  //Verif a faire pour savoir si bon compte
  const pseudo = req.body.pseudo + req.body.CurrentClass;
  const id = getCookie("id", req);

  con.query("SELECT googleId,users FROM user WHERE googleId = ?", [id], function(err, result) {
  if (err) throw err;
  if (result.length != []){
    if (result[0].users != null && result[0].users == pseudo){
      res.cookie("username",pseudo,{path:'/',maxAge:2*60*1000});//le cookie reste 2min
      return res.redirect('/');
    }
    else if(result[0].users != pseudo && result[0].users != null){
      return res.render('login');//,{Btn : "Mauvais pseudo"});
    }
    else {
      con.query('UPDATE user SET users=? WHERE googleId = ?', [pseudo,id], function(err,result) {
        if (err) throw err;
        res.cookie("username",pseudo,{path:'/',maxAge:2*60*1000});//le cookie reste 2min
        return res.redirect('/');
      });
    }
  }
  });
  //return res.render('login');//,{Btn : "No count found"});
});

module.exports = router;
