var express = require('express');
var router = express.Router();
var mysql = require('mysql2');

// Database connection & creation
var con = mysql.createPool({
  host: "yamanote.proxy.rlwy.net",
  port: "30831",
  database: "railway",
  user: "root",
  password: "yMdXBhOeslFOqRfhbbHUWUlijPQZtLlI"
});

/* GET home page. */
router.get('/', function(req, res, next) {
    pseudo = req.query.pseudo;
    con.query('SELECT maintenance, mtnTittle,mtnText FROM global WHERE id = 1', (err, result) => {
        if (err) throw err;
        if (result.length > 0 && result[0].maintenance) {
        return res.render('waiting', { title: result[0].mtnTittle, text: result[0].mtnText});
        } 
      else{
        con.query('SELECT afficheBan,motif,time,dureeBan FROM ban WHERE users = ?',[pseudo], (err, result) => {
          if (err) throw err;
          if (result.length > 0) {
            if(Date.now()-result[0].time > result[0].dureeBan){
              return res.redirect('/')
            }
            else{
              const timeRemain = result[0].dureeBan - (Date.now()-result[0].time);
              return res.render('waiting', { title: `Ban : ${Math.floor(timeRemain/1000)} secondes`, text: result[0].motif});
            }
          } 
          else {
            return res.redirect('/');
          }
        });
      }
  });

});

module.exports = router;