var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/', function(req, res, next) {
  const pseudo = req.session.pseudo;
  res.render('grid',{pseudo})
});

//requete colori pixel :

// Modifie bdd 
// Réimporte la grid pou rtt le monde
// Lancer fct dessiner grid pour tt users

module.exports = router;
