const { name } = require('ejs');
var mysql = require('mysql2');
require("dotenv").config();


const name_team = ['F1','JASA','VIPERE','LICORNE'];

//var con = mysql.createPool({
//  host: "localhost",
//  user: "devuser",
//  password: "monpassword",
//  database: "pixelwar"
//});

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


// DROP TABLE → CREATE TABLE → INSERT → SELECT
con.query("DROP TABLE IF EXISTS team", function(err) {
  if (err) throw err;
  console.log("Table team dropped!");

  const create_global = `
  CREATE TABLE IF NOT EXISTS team (
    id INT AUTO_INCREMENT,
      name VARCHAR(50),
      nbrPixel BIGINT DEFAULT 0,
      PRIMARY KEY (id)
    )
  `;
  
  con.query(create_global, function(err) {
    if (err) throw err;
    console.log("Table global created!");
    
    
    for (const values of name_team){
        
        con.query(`INSERT INTO team (name) VALUES (?)`, [values],(err,result) => {
          if (err) throw err;
          console.log("Default team settings inserted!");
    
          con.query("SELECT * FROM team", function(err, result) {
              if (err) throw err;
              console.log("Contenu de la table global :", result);
            });
        });
    }

    
  });
});
console.log("Everything done properly")