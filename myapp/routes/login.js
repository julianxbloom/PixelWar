var express = require('express');
const { route } = require('./grid');
var router = express.Router();

/* GET home page. */
router.get('/', (req, res) => {
  res.render('login')
});

router.post('/', (req, res) => {
  res.redirect('/grid')
});

module.exports = router;
