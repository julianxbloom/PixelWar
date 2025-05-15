var mysql = require('mysql2');


const canvaSize = 150;

// Database connection & creation
var con = mysql.createConnection({
  host: "yamanote.proxy.rlwy.net",
  port: "30831",
  database: "railway",
  user: "root",
  password: "yMdXBhOeslFOqRfhbbHUWUlijPQZtLlI"
});

con.connect(function(err) {
  if (err) throw err;
  var drop_pixels = `DROP TABLE IF EXISTS pixels`;
  con.query(drop_pixels, function(err, result) {
    if (err) throw err;
    console.log("Table pixels dropped!");
  });
  console.log("Connected!");
  var user_creation = `CREATE TABLE IF NOT EXISTS pixels(
    id INT AUTO_INCREMENT,
    user VARCHAR(100),
    userId INT,
    x INT,
    y INT,
    color VARCHAR(15) DEFAULT '#C0C0C0',
    PRIMARY KEY(id)
  )`;
  con.query(user_creation, function(err, result) {
    if (err) throw err;
    console.log("Table pixels created!");
    createTable();
    showTable("pixels");
  });

  con.query("SELECT * FROM pixels", function(err, result) {
    if (err) throw err;
    console.log(result);
  });
});

function createTable(){

  for (let i = 0; i<canvaSize*canvaSize;i++){

    const user = "none";
    const userId = -1;
    const x = i%canvaSize;
    const y = Math.floor(i/canvaSize);
    //const color = (x%2==1) ? '#C0C0C0' : "#808080";
    const color = "#adacac";

    const sql = `INSERT INTO pixels (user, userId, x, y, color) VALUES (?, ?, ?, ?, ?)`;
    con.query(sql, [user,userId, x, y, color]);
  }
}

function showTable(name){
  con.query(`SELECT * FROM ${name}`, function(err, result) {
    if (err) throw err;
    console.log(result);
  });
}