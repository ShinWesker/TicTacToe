const sqlite3 = require('sqlite3').verbose();
const { promisify } = require('util');
const DBSOURCE = './tictactoe.db';

const db = new sqlite3.Database(DBSOURCE, sqlite3.OPEN_READWRITE | sqlite3.OPEN_CREATE, (err) => {
  if (err) {
    console.error('Could not connect to database', err);
  } else {
    console.log('Connected to the tictactoe database.');
    initDb();
  }
});

db.run = promisify(db.run);
db.get = promisify(db.get);
db.all = promisify(db.all);
db.close = promisify(db.close);

// TicTacToe Tabelle erstellen, falls nicht vorhanden
async function initDb() {
  try {
    await db.run(`CREATE TABLE IF NOT EXISTS game_state (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      player1 TEXT,
      player2 TEXT,
      current_turn TEXT,
      game_board TEXT,
      winner TEXT,
      timestamp DATETIME DEFAULT CURRENT_TIMESTAMP
    )`);
    console.log('Initialized the game_state table.');
  } catch (err) {
    console.error(err.message);
  }
}

// CRUD Funktionen

// Neue Spiel erstellen
async function createGame(player1, player2) {
  const gameBoard = JSON.stringify(['', '', '', '', '', '', '', '', '']);
  const sql = `INSERT INTO game_state (player1, player2, current_turn, game_board) VALUES (?, ?, 'X', ?)`;
  try {
    const { lastID } = await db.run(sql, [player1, player2, gameBoard]);
    return { id: lastID, player1, player2, current_turn: 'X', game_board: gameBoard };
  } catch (err) {
    throw err;
  }
}

// Spielzustand abrufen
async function getGameState() {
  const sql = `SELECT * FROM game_state ORDER BY id DESC LIMIT 1`;
  try {
    const row = await db.get(sql);
    return row;
  } catch (err) {
    throw err;
  }
}

// Spiel aktualisieren
async function updateGame(id, gameBoard, currentTurn, winner) {
  const sql = `UPDATE game_state SET game_board = ?, current_turn = ?, winner = ? WHERE id = ?`;
  try {
    await db.run(sql, [JSON.stringify(gameBoard), currentTurn, winner, id]);
    return { id, game_board: gameBoard, current_turn: currentTurn, winner };
  } catch (err) {
    throw err;
  }
}

// Spiel zurücksetzen/löschen
async function resetGame(id) {
  const sql = `DELETE FROM game_state WHERE id = ?`;
  try {
    await db.run(sql, id);
  } catch (err) {
    throw err;
  }
}

module.exports = { createGame, getGameState, updateGame, resetGame };
