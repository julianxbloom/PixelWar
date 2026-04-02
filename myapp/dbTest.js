//Count nbr in one team :

const { name } = require('ejs');
var mysql = require('mysql2');
require("dotenv").config();

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
}))

con.query("SELECT COUNT(users), team FROM user WHERE nbrColor>30 GROUP BY team", function(err,result) {
    if(err) throw err;

    console.log(result);



})