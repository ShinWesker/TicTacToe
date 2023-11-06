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

function run(sql, params) {
  return new Promise((resolve, reject) => {
    db.run(sql, params, function (err) {
      if (err) {
        reject(err);
      } else {
        resolve({ lastID: this.lastID, changes: this.changes });
      }
    });
  });
}

// CRUD Funktionen

//Neues Spiel erstellen
async function createGame(player1) {
  const gameBoard = JSON.stringify(['', '', '', '', '', '', '', '', '']);
  const sql = `INSERT INTO game_state (player1, current_turn, game_board) VALUES (?, 'X', ?)`;
  try {
    const { lastID } = await run(sql, [player1, gameBoard]);
    return { id: lastID, player1, current_turn: 'X', game_board: gameBoard };
  } catch (err) {
    throw err;
  }
}

// Spieler zu einem bestehenden Spiel hinzufügen
async function joinGame(id, player2) {
  // Check for valid input
  if (!id || !player2) {
    throw new Error('Invalid game ID or player name.');
  }

  const sql = `UPDATE game_state SET player2 = ? WHERE id = ? AND player2 IS NULL`;
  
  try {
    const result = await db.run(sql, [player2, id]);
    const changes = result.changes;

    if (changes > 0) {
      return { id, player2 };
    } else {
      return { error: 'Game not found or already has a second player.' };
    }
  } catch (err) {
    // Log the error for debugging purposes
    console.error(err);
    throw new Error('An error occurred while joining the game.');
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

module.exports = {initDb, createGame, getGameState, updateGame, resetGame, joinGame };
