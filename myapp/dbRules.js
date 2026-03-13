var mysql = require('mysql2');
require("dotenv").config();

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
  database:process.env.MYSQLNAME,
  port: process.env.MYSQLPORT,
  // --- C'EST CETTE PARTIE QUI MANQUE ---
  ssl: {
    minVersion: 'TLSv1.2',
    rejectUnauthorized: false
  }

}))

// DROP TABLE → CREATE TABLE → SELECT
con.query("DROP TABLE IF EXISTS rules", function(err) {
  if (err) throw err;
  console.log("Table rules dropped!");

  const create_rules = `
    CREATE TABLE IF NOT EXISTS rules (
      id INT AUTO_INCREMENT,
      timeRaid INT,
      powerBase INT,
      powerRaid INT,
      delayBase INT,
      delayRaid INT,
      gridSize INT,
      PRIMARY KEY(id)
    )
  `;

  con.query(create_rules, function(err) {
    if (err) throw err;
    console.log("Table rules created!");

    // Maintenant la table existe → OK pour SELECT
    con.query("SELECT * FROM rules", function(err, result) {
      if (err) throw err;
      console.log("Contenu de la table rules :", result);
      process.exit(); // fermer proprement
    });
  });
});
