<template>
  <div>
    <h1>Tic Tac Toe</h1>
    <div v-if="winner">{{ winner }} hat gewonnen!</div>
    <div v-else-if="isDraw">Unentschieden!</div>
    <div v-if="!gameId">
      <div>
        <input type="text" v-model="playerName" placeholder="Enter your name"/>
        <button @click="createGame">Start Game</button>
      </div>
      <div>
        <input type="text" v-model="existingGameId" placeholder="Enter Game ID to join"/>
        <button @click="joinExistingGame">Join Game</button>
      </div>
    </div>
    <div v-else id="board">
      <div v-for="(cell, index) in gameState" :key="index" class="square" @click="makeMove(index)">
        {{ cell }}
      </div>
    </div>
    <div v-if="gameId">
      Your game ID: {{ gameId }}
    </div>
  </div>
</template>

<script>
import axios from 'axios';

export default {
  data() {
    return {
      gameState: [],
      currentPlayer: '',
      gameId: null,
      playerName: '',
      existingGameId: '',
      winner: null,
      isDraw: false
    };
  },
  methods: {
    async createGame() {
      try {
        const response = await axios.post('http://localhost:3000/api/game', {
          player1: this.playerName
        });
        this.gameId = response.data.id;
        this.gameState = JSON.parse(response.data.game_board);
        this.currentPlayer = response.data.current_turn;
      } catch (error) {
        console.error('Error creating game:', error);
      }
    },
    async joinExistingGame() {
      try {
        const response = await axios.post(`http://localhost:3000/api/game/${this.existingGameId}/join`, {
          player2: this.playerName
        });
        this.gameId = this.existingGameId;
        if (!response.data.error) {
          const gameState = await this.fetchGameState();
          this.gameState = JSON.parse(gameState.game_board);
          this.currentPlayer = gameState.current_turn;
        } else {
          console.error(response.data.error);
        }
      } catch (error) {
        console.error('Error joining game:', error);
      }
    },
    async fetchGameState() {
      try {
        const response = await axios.get('http://localhost:3000/api/game');
        return response.data;
      } catch (error) {
        console.error('Error fetching game state:', error);
      }
    },
    async makeMove(index) {
  if (this.gameState[index] || this.winner || this.isDraw) return;

  // Reflect the move locally first
  const originalValue = this.gameState[index];
  this.gameState[index] = this.currentPlayer;
  
  try {
    // Send the move to the backend
    const response = await axios.put(`http://localhost:3000/api/game/${this.gameId}`, {
      gameBoard: JSON.stringify(this.gameState),
      index: index,
      currentTurn: this.currentPlayer
    }, {
      headers: {
        'Content-Type': 'application/json'
      }
    });
    
    // Update local state with response
    this.gameState = JSON.parse(response.data.game_board);
    this.currentPlayer = response.data.current_turn;
    this.winner = response.data.winner;
  } catch (error) {
    console.error('Error making move:', error);
    // If there's an error, revert the move locally
    this.gameState[index] = originalValue;
  }
}
  }
};
</script>

<style scoped>
#board {
  display: grid;
  grid-template-columns: repeat(3, 100px);
  gap: 10px;
}
.square {
  width: 100px;
  height: 100px;
  background-color: #ddd;
  display: flex;
  justify-content: center;
  align-items: center;
  font-size: 2em;
  cursor: pointer;
}
</style>
