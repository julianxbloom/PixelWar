var express = require('express');
var router = express.Router();
var mysql = require('mysql2');

require("dotenv").config();

//router.use(express.urlencoded({ extended: true }));

var con = mysql.createPool(({
  host:process.env.DB_HOST,
  user:process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database:process.env.DB_NAME,
  port: process.env.DB_PORT,
  // --- C'EST CETTE PARTIE QUI MANQUE ---
  ssl: {
    minVersion: 'TLSv1.2',
    rejectUnauthorized: true
  }

}))

router.get('/', (req, res) => {
    let text = "";
    con.query('SELECT name,nbrPixel FROM team ORDER BY nbrPixel DESC',(err,result)=>{
        if (err) throw err;

        for (team of result){
            text+= team.name + " : " + team.nbrPixel;
            text+="<br>";
        }

        return res.render('dashboard',{
            team_values:text,
        });
    });
});


module.exports = router;