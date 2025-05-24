var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/', function(req, res, next) {
    con.query('SELECT maintenance, mtnTittle,mtnText FROM maintenance WHERE id = 1', (err, result) => {
        if (err) throw err;
        if (result.length > 0 && result[0].maintenance) {
        return res.render('waiting', { title: result[0].mtnTittle, text: result[0].mtnText});
        } });

    return res.redirect('/')
});

module.exports = router;