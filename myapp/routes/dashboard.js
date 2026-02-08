var express = require('express');
var router = express.Router();

//router.use(express.urlencoded({ extended: true }));

router.get('/', (req, res) => {
    return res.render('dashboard');
});

module.exports = router;