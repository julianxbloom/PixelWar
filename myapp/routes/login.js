var express = require('express');
const { route } = require('./grid');
var router = express.Router();

/* GET request */
router.get('/', (req, res) => {
  res.render('login')
});

/* POST request */
router.post('/', (req, res) => {

  //Classe = document.getElementById('class-select').options[Class.selectedIndex].text;
  //alert(Classe);

  //Verif a faire pour savoir si bon compte
  res.redirect('/grid')
  
});

module.exports = router;
