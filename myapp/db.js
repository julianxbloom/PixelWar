var mysql = require('mysql2');

var con = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: "root",
  database: "pixelwar"
});

con.connect(function(err) {
  if (err) throw err;
  console.log("Connected!");
  var user_creation = `CREATE TABLE IF NOT EXISTS users(
    id INT AUTO_INCREMENT,
    username VARCHAR(100),
    pixelAvailable INT DEFAULT 5,
    lastTimeUpdate TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY(id)
  )`;
  con.query(user_creation, function(err, result) {
    if (err) throw err;
    console.log("Table users created!");
  });
});