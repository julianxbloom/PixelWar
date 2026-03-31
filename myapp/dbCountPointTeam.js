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
  database:process.env.MYSQLDATABASE,
  port: process.env.MYSQLPORT,
  // --- C'EST CETTE PARTIE QUI MANQUE ---
  ssl: {
    minVersion: 'TLSv1.2',
    rejectUnauthorized: false
  }

}))

con.query(`
    SELECT team, SUM(nbrColor) AS totalPoints
    FROM user
    GROUP BY team;
`, (err, results) => {
  if (err) throw err;

  // results est déjà un tableau
  console.log(results);
});
/*
con.query(`
  UPDATE user
  SET team = TRIM(team)
  WHERE team != TRIM(team)
`, (err, result) => {
  if (err) throw err;

  console.log(`Lignes modifiées : ${result.affectedRows}`);
});*/

con.query(`TRUNCATE TABLE team`, (err) => {
  if (err) throw err;
  console.log("Table team vidée !");
});

con.query(`
  INSERT INTO team (name, nbrPixel)
  SELECT LOWER(team), SUM(nbrColor)
  FROM user
  GROUP BY LOWER(team)
`, (err, result) => {
  if (err) throw err;
  console.log("Teams insérées !");
});