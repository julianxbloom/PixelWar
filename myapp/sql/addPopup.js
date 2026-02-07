var mysql = require('mysql2');
require("dotenv").config();

//var con = mysql.createPool({
//  host: "localhost",
//  user: "devuser",
//  password: "monpassword",
//  database: "pixelwar"
//});

var con = mysql.createPool(({
  host:process.env.DB_HOST,
  user:process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database:process.env.DB_NAME,
  port: 4000,
  // --- C'EST CETTE PARTIE QUI MANQUE ---
  ssl: {
    minVersion: 'TLSv1.2',
    rejectUnauthorized: true
  }

}))

popup = "Hello world !";
users = "timTG01"
con.connect(function(err){
    if (err) throw err;
    con.query("UPDATE user SET popup = ? WHERE users = ?",[popup,users], function(err, result) {
        if (err) throw err;
        console.log(result);
    });
});
