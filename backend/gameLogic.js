// gameLogic.js

// Überprüft das Spielbrett und gibt den Gewinner oder Unentschieden zurück
function checkForWinner(gameBoard) {
    //[0, 1, 2]
    //[3, 4, 5]
    //[6, 7 ,8]
    const winConditions = [
      [0, 1, 2],
      [3, 4, 5],
      [6, 7, 8],
      [0, 3, 6],
      [1, 4, 7],
      [2, 5, 8],
      [0, 4, 8],
      [2, 4, 6],
    ];
  
    for (let i = 0; i < winConditions.length; i++) {
      const [a, b, c] = winConditions[i];
      if (gameBoard[a] && gameBoard[a] === gameBoard[b] && gameBoard[a] === gameBoard[c]) {
        return gameBoard[a];  // 'X' oder 'O'
      }
    }
  
    // Überprüft, ob das Spielbrett voll ist
    const isBoardFull = gameBoard.every(cell => cell !== '');
    return isBoardFull ? 'D' : null;  // 'D' für Unentschieden (Draw)
  }
  
  // Überprüft, ob der angegebene Zug gültig ist (Feld ist leer und es ist der richtige Spieler am Zug)
  function isValidMove(gameBoard, index, currentTurn) {
    return gameBoard[index] === '' && currentTurn === gameBoard[index];
  }
  
  // Aktualisiert den Spieler, der als nächstes am Zug ist
  function getNextTurn(currentTurn) {
    return currentTurn === 'X' ? 'O' : 'X';
  }
  
  module.exports = {
    checkForWinner,
    isValidMove,
    getNextTurn
  };
  