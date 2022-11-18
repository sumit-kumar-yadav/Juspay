const express = require('express');
const details = require('./details');
const app = express();
const port = 4000;

app.use(express.json());

app.get('/', (req, res) => {
  res.send('OK!');
})

app.post('/url/info', (req, res) => {
  details.fetchUrlInfo(req.body.url).then(d => {
    res.json(d);
  })
})

app.listen(port, () => {
  console.log(`Details-www listening at: ${port}`);
})
