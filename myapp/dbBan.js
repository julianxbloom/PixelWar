var mysql = require('mysql2');

var con = mysql.createPool({
  host: "localhost",
  user: "devuser",
  password: "monpassword",
  database: "pixelwar"
});

console.log("Timestamp:", Date.now());

// --- DROP TABLE → CREATE TABLE → SELECT ---
con.query("DROP TABLE IF EXISTS ban", function(err) {
  if (err) throw err;
  console.log("Table ban dropped!");

  const create_table = `
    CREATE TABLE IF NOT EXISTS ban (
      users VARCHAR(100),
      time BIGINT DEFAULT 9999999999999,
      afficheBan TEXT,
      motif TEXT,
      dureeban INT,
      PRIMARY KEY (users)
    )
  `;

  con.query(create_table, function(err) {
    if (err) throw err;
    console.log("Table ban created!");

    // Check content
    con.query("SELECT * FROM ban", function(err, result) {
      if (err) throw err;
      console.log("Current ban table:", result);

      //process.exit(); // Décommente si tu veux que le script se ferme
    });
  });
});


// ------------------ BAN FUNCTION ------------------

function ban(user, duree, motif) {
  const sql = `
    INSERT INTO ban (users, time, dureeban, motif, afficheBan)
    VALUES (?, ?, ?, ?, ?)
    ON DUPLICATE KEY UPDATE
      time = VALUES(time),
      dureeban = VALUES(dureeban),
      motif = VALUES(motif),
      afficheBan = VALUES(afficheBan)
  `;

  const affiche = `Ban : ${duree / 1000} secondes`;

  con.query(sql, [user, Date.now(), duree, motif, affiche], function(err) {
    if (err) throw err;
    console.log(`Ban enregistré pour ${user}`);
  });

  con.query("UPDATE user SET ban = TRUE WHERE users = ?", [user], function(err) {
    if (err) throw err;
    console.log(`User ${user} marqué comme banni`);
  });
}

// Exemple d'utilisation :
// ban("MerlinTG04", 60 * 60 * 1000, "Cheh lol ");
