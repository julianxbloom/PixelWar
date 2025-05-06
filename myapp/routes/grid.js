var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/', function(req, res, next) {
 
  //Cookies pour le nbr de chg qu'un mec peut faire
  const {getCookie} = require('../public/javascripts/cookieUtils'); 
  if (getCookie("username",req) != null){
    res.render('grid',{pseudo : getCookie("username",req)})
  }
  
  else{
    res.redirect('/login');
  }
  
});

//requete colori pixel :

// Modifie bdd 
// Réimporte la grid pou rtt le monde
// Lancer fct dessiner grid pour tt users

module.exports = router;
