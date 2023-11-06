const express = require('express');
const bodyParser = require('body-parser');
const app = express();
const port = 3000;

const cors = require('cors');
const corsOptions = {
  origin: 'http://localhost:8080',
  optionsSuccessStatus: 200
};
app.use(cors());
app.use(bodyParser.json());

const gameRoutes = require('./routes/game');
app.use('/api', gameRoutes);

const db = require('./db/db');

db.initDb().then(() => {
  app.listen(port, () => {
    console.log(`Server running on port ${port}`);
  });
}).catch(err => {
  console.error("Error during DB initialization", err);
});