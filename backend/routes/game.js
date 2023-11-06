const express = require('express');
const db = require('../db/db');
const router = express.Router();

// Beispiel für das Abrufen des aktuellen Spielstands
router.get('/game', (req, res) => {
  db.get('SELECT * FROM game_state ORDER BY id DESC LIMIT 1', (err, row) => {
    if (err) {
      res.status(500).send(err.message);
    } else {
      res.json(row);
    }
  });
});

module.exports = router;
