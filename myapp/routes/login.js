var express = require('express');
const { route } = require('./grid');
var router = express.Router();

/* GET request */
router.get('/', (req, res) => {
  res.render('login')
});

/* POST request */
router.post('/', (req, res) => {
  res.redirect('/grid')
});

module.exports = router;
