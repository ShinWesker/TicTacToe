const express = require('express');
const bodyParser = require('body-parser');
const app = express();
const port = 3000;
const gameRoutes = require('./routes/game');


app.use(bodyParser.json());
app.use('/api', gameRoutes);


app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});