var express = require('express');
var router = express.Router();

/* GET grid page. */
router.get('/grid', function(req, res, next) {
  res.render('grid', {});
});

module.exports = router;
