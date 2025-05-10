var express = require('express');
const { route } = require('./grid');
var router = express.Router();

router.use(express.urlencoded({ extended: true }));

//Cookies pour le nbr de chg qu'un mec peut faire
 const {getCookie} = require('../public/javascripts/cookieUtils');

/* GET request */
router.get('/', (req, res) => {

  if (getCookie("username",req) == "JulianTG01"){
    if (!getCookie("power",req)){
      res.cookie("power",0,{path:'/',maxAge:2*60*1000});
    }
    res.redirect('/grid');
  }
  else {
    res.render('login',{Btn : "Tu n'es pas connecté"});
  }
});

/* POST request */
router.post('/', (req, res) => {

  //Verif a faire pour savoir si bon compte
  const pseudo = req.body.pseudo+req.body.CurrentClass

  if (getCookie("username",req) == "JulianTG01"){
    if (!getCookie("power",req)){
      res.cookie("power",0,{path:'/',maxAge:2*60*1000});
    }
    res.redirect('/grid');
  }

  else if (pseudo == "JulianTG01"){

    if (!getCookie("power",req) || !getCookie("username",req)){
      res.cookie("power",7,{path:'/',maxAge:2*60*1000});//le cookie reste 1 semaine
      res.cookie("username",pseudo,{path:'/',maxAge:2*60*1000});//le cookie reste 1 semaine
    }

    res.redirect('/grid');
  }

  else {
    res.render('login',{Btn : "Wrong pseudo,Retry"});
  }
});

module.exports = router;
