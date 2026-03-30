var express = require('express');
var router = express.Router();
var mysql = require('mysql2');

require("dotenv").config();

//router.use(express.urlencoded({ extended: true }));

var con = mysql.createPool(({
  host:process.env.MYSQLHOST,
  user:process.env.MYSQLUSER,
  password: process.env.MYSQLPASSWORD,
  database:process.env.MYSQLDATABASE,
  port: process.env.MYSQLPORT,
  // --- C'EST CETTE PARTIE QUI MANQUE ---
  ssl: {
    minVersion: 'TLSv1.2',
    rejectUnauthorized: false
  }

}));

router.get('/', (req, res) => {
    let text = "";
    con.query('SELECT name,nbrPixel FROM team ORDER BY nbrPixel DESC',(err,result)=>{
        if (err) throw err;

        for (team of result){
            text+= team.name + " : " + team.nbrPixel;
            text+="<br>";
            console.log("team :",team.name,team.nbrPixel);
        }

        return res.render('dashboard',{
            team_values:text,
        });
    });
});


module.exports = router;