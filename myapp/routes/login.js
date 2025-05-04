var express = require('express');
const { route } = require('./grid');
var router = express.Router();

router.use(express.urlencoded({ extended: true }));

/* GET request */
router.get('/', (req, res) => {
  
  res.render('login',{Btn : "tu n'es pas connecté"});
});

/* POST request */
router.post('/', (req, res) => {
  //Verif a faire pour savoir si bon compte
  const pseudo = req.body.pseudo+req.body.CurrentClass
  if (pseudo == "JulianTG01"){
    req.session.pseudo = pseudo;

    //Cookies pour le nbr de chg qu'un mec peut faire
    const {getCookie} = require('../public/javascripts/cookieUtils');

    if (!getCookie){
      res.cookie("power",7,{path:'/',maxAge:2*60*1000});//le cookie reste 1 semaine
    }

    res.redirect('/grid');
  }

  else {
    res.render('login',{Btn : "Wrong pseudo,Retry"});
  }
});

module.exports = router;
