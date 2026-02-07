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

// DROP TABLE → CREATE TABLE → INSERT → SELECT
con.query("DROP TABLE IF EXISTS global", function(err) {
  if (err) throw err;
  console.log("Table global dropped!");

  const create_global = `
    CREATE TABLE IF NOT EXISTS global (
      id INT AUTO_INCREMENT,
      maintenance BOOLEAN DEFAULT FALSE,
      mtnTittle VARCHAR(100) DEFAULT 'Debut :',
      mtnText TEXT,
      PRIMARY KEY (id)
    )
  `;

  con.query(create_global, function(err) {
    if (err) throw err;
    console.log("Table global created!");

    const insert_default = `
      INSERT INTO global (maintenance, mtnTittle, mtnText)
      VALUES (FALSE, 'Welcooooome', 'Ce site ouvrira ses portes le mercredi 4 Juin à 10h')
    `;

    con.query(insert_default, function(err) {
      if (err) throw err;
      console.log("Default global settings inserted!");

      con.query("SELECT * FROM global", function(err, result) {
        if (err) throw err;
        console.log("Contenu de la table global :", result);
        process.exit(); // fermeture propre
      });
    });
  });
});
