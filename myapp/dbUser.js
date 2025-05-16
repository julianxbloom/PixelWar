var mysql = require('mysql2');

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
  var drop_user = `DROP TABLE IF EXISTS user`;
  con.query(drop_user, function(err, result) {
    if (err) throw err;
    console.log("Table user dropped!");
  });
  console.log("Connected!");
  var user_creation = `CREATE TABLE IF NOT EXISTS user(
    id INT AUTO_INCREMENT,
    user VARCHAR(100) DEFAULT nobody,
    power INT DEFAULT 5,
    time STR DEFAULT none,

  )`;
  con.query(user_creation, function(err, result) {
    if (err) throw err;
    console.log("Table user created!");
    createTable();
    showTable("user");
  });

  con.query("SELECT * FROM user", function(err, result) {
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

    const sql = `INSERT INTO user (user, userId, x, y, color) VALUES (?, ?, ?, ?, ?)`;
    con.query(sql, [user,userId, x, y, color]);
  }
}

function showTable(name){
  con.query(`SELECT * FROM ${name}`, function(err, result) {
    if (err) throw err;
    console.log(result);
  });
}