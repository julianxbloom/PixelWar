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
    con.query('SELECT maintenance, mtnTittle,mtnText FROM global WHERE id = 1', (err, resu) => {
        if (err) throw err;
        if (resu.length > 0 && resu[0].maintenance) {
        return res.render('waiting', { title: resu[0].mtnTittle, text: resu[0].mtnText});
        } 
      else{
        con.query('SELECT ban FROM user WHERE users = ?',[pseudo], (err,res)=>{
          if (err) throw err;
          if (res.length > 0) {
            con.query('SELECT afficheBan,motif,time,dureeBan FROM ban WHERE users = ?',[pseudo], (err, result) => {
              if (err) throw err;
              if (result.length > 0) {
                if(Date.now()-result[0].time > result[0].dureeBan){
                  return res.redirect('/')
                }
                else{
                  const timeRemain = result[0].time>Date.now() ? "Votre ban va être défini":`Ban : ${Math.floor((result[0].dureeBan - (Date.now()-result[0].time))/1000)} secondes`;
                  return res.render('waiting', { title: timeRemain, text: result[0].motif});
                }
              } 
              else {
                return res.redirect('/');
              }
            });
          }
          else{
            return res.redirect('/');
          }
        })

      }
  });

});

module.exports = router;