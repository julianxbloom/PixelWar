var express = require('express');
var router = express.Router();
const session = require('express-session');

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Express' });
});

/*Pour creer une session*/
router.use(session({
  secret: 'ton-secret', // choisis un secret sécurisé
  resave: false,
  saveUninitialized: true
}));

module.exports = router;
