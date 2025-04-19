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
  //Verif a faire pour savoir si bon compte
  const pseudo = req.body.pseudo+req.body.CurrentClass
  if (pseudo == "JulianTG01"){
    req.session.pseudo = pseudo;
    res.redirect('/grid');
  }

  else {
  res.render('login',{Btn : "Wrong pseudo,Retry"});
  }
});

module.exports = router;
