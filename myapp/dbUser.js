var mysql = require('mysql2');
require('dotenv').config();

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

// DROP TABLE, puis CREATE TABLE, puis SELECT
con.query("DROP TABLE IF EXISTS `user`", function(err) {
  if (err) throw err;
  console.log("Table user dropped!");

  const user_creation = `
    CREATE TABLE IF NOT EXISTS \`user\` (
      id INT AUTO_INCREMENT,
      googleId VARCHAR(100) NOT NULL,
      users VARCHAR(100) DEFAULT 'nobody',
      power INT DEFAULT 5,
      time VARCHAR(100) DEFAULT 'none',
      popup TEXT,
      nbrColor INT DEFAULT 0,
      admin BOOLEAN DEFAULT FALSE,
      ban BOOLEAN DEFAULT FALSE,
      PRIMARY KEY(id)
    )
  `;

  con.query(user_creation, function(err) {
    if (err) throw err;
    console.log("Table user created!");

    // Maintenant la table existe → OK pour SELECT
    con.query("SELECT * FROM `user`", function(err, result) {
      if (err) throw err;
      console.log("Contenu de la table user :", result);
      process.exit(); // pour fermer proprement
    });
  });
});
