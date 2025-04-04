var express = require('express');
const { route } = require('./grid');
var router = express.Router();

router.use(express.urlencoded({ extended: true }));

/* GET request */
router.get('/', (req, res) => {
  res.render('login',{Btn : ""});
});

/* POST request */
router.post('/', (req, res) => {

  const pseudo = req.body.pseudo+req.body.CurrentClass
  if (pseudo == "JulianTG01"){
    res.redirect('/grid');
  }

  else {
    res.render('login',{Btn : "Wrong pseudo,Retry"});
  }

  //Verif a faire pour savoir si bon compte
  
  
});

module.exports = router;
