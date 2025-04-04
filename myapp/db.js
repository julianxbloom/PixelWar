const mysql = require("mysql2")

connection = mysql.createConnection({
    host: mysql.railway,
    port: 3306,
    user: root,
    password: yMdXBhOeslFOqRfhbbHUWUlijPQZtLlI,
    database: railway,
  });
  connection.connect((err) => {
    if (err) {
      console.error("CONNECT FAILED", err.code);
    } else console.log("CONNECTED");
  });
  
  module.exports = { connection };