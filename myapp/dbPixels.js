#!/usr/bin/env node
const canvaSize = 500;
var mysql = require('mysql2');
require("dotenv").config();

//var con = mysql.createcon({
//  host: "localhost",
//  user: "devuser",
//  password: "monpassword",
//  database: "pixelwar"
//});

var pool = mysql.createPool(({
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

// Connexion au con
pool.getConnection((err, connection) => {
  if (err) {
    console.error("Erreur de connexion :", err);
    process.exit(1);
  }

  console.log("Connecté à MySQL !");

  // Supprimer la table
  const dropPixels = `DROP TABLE IF EXISTS pixels`;
  connection.query(dropPixels, (err) => {
    if (err) throw err;
    console.log("Table pixels supprimée.");

    // Création de la table
    const createPixels = `
      CREATE TABLE IF NOT EXISTS pixels (
        id INT AUTO_INCREMENT,
        x INT,
        y INT,
        color VARCHAR(25) DEFAULT 'rgb(255, 255, 255)',
        affiche VARCHAR(100) DEFAULT 'blank',
        PRIMARY KEY(id)
      )
    `;
    connection.query(createPixels, (err) => {
      if (err) throw err;

      console.log("Table pixels créée !");

      // Insérer toutes les cases
      insertPixels(connection);
    });
  });
});

// Insère les 200x200 pixels
function insertPixels(connection) {
  const total = canvaSize * canvaSize;
  console.log(`Insertion de ${total} pixels…`);

  // Pour éviter 40 000 requêtes individuelles, on prépare les valeurs
  let values = [];
  for (let i = 0; i < total; i++) {
    const x = i % canvaSize;
    const y = Math.floor(i / canvaSize);
    values.push([x, y]);
  }

  const sql = "INSERT INTO pixels (x, y) VALUES ?";

  connection.query(sql, [values], (err) => {
    if (err) throw err;

    console.log("Insertion terminée !");
    connection.release();
    process.exit(0);
  });
}
