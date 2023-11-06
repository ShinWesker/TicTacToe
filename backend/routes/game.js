const express = require('express');
const router = express.Router();
const db = require('../db/db.js');
const gameLogic = require('../gameLogic'); // Pfad anpassen, wo Sie die gameLogic.js platziert haben

// Spiel erstellen
router.post('/game', async (req, res) => {
  try {
    const { player1 } = req.body;
    const newGame = await db.createGame(player1);
    res.status(201).json(newGame);
  } catch (error) {
    console.error(error)
    res.status(500).json({ error: error.message });
  }
});

// Spiel beitreten
router.post('/game/:id/join', async (req, res) => {
  try {
    const { player2 } = req.body;
    const { id } = req.params;
    const result = await db.joinGame(id, player2);
    res.status(200).json(result);
  } catch (error) {
    console.error(error)
    res.status(500).json({ error: error.message });
  }
});

// Spielzustand abrufen
router.get('/game', async (req, res) => {
  try {
    const gameState = await db.getGameState();
    if (gameState) {
      res.json(gameState);
    } else {
      res.status(404).json({ message: 'No game state found.' });
    }
  } catch (error) {
    console.error(error)
    res.status(500).json({ error: error.message });
  }
});

// Spiel aktualisieren
router.put('/game/:id', async (req, res) => {
  try {
    const { gameBoard, index, currentTurn } = req.body;
    const { id } = req.params;

    // Hole den aktuellen Spielzustand
    const gameState = await db.getGameState(id);

    // Überprüfe, ob der Zug gültig ist
    if (!gameLogic.isValidMove(gameState.game_board, index, currentTurn)) {
      return res.status(400).json({ message: "Invalid move." });
    }

    // Setze den Spielzug um
    const updatedBoard = [...gameState.game_board];
    updatedBoard[index] = currentTurn;

    // Überprüfe auf einen Gewinner
    const winner = gameLogic.checkForWinner(updatedBoard);

    // Aktualisiere den nächsten Spieler
    const nextTurn = gameLogic.getNextTurn(currentTurn);

    // Aktualisiere das Spiel in der Datenbank
    const updatedGame = await db.updateGame(id, updatedBoard, nextTurn, winner);

    res.json(updatedGame);
  } catch (error) {
    console.error(error)
    res.status(500).json({ error: error.message });
  }
});

// Spiel zurücksetzen/löschen
router.delete('/game/:id', async (req, res) => {
  try {
    const { id } = req.params;
    await db.resetGame(id);
    res.json({ message: `Game with ID ${id} has been reset.` });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
