const express = require('express');
const pi = require('./pinger');
const app = express();
const port = 3000;

app.use(express.json());

let urls = ['https://google.com', 'https://api.nasa.gov', 'https://juspay.in', 'https://127.0.0.1/fail'];

setInterval(() => pi.ping(urls), 10000);

app.get('/', (req, res) => {
  res.send('OK!');
})

app.get('/ping/stats', (req, res) => {
  res.json(pi.pingState);
})

app.get('/ping/urls', (req, res) => {
  res.json(urls);
})

app.post('/ping/updateUrl', (req, res) => {
  if(req.body.url) {
    urls.push(req.body.url);
    urls = [...new Set(urls)];
    res.json(urls);
  }
})

app.listen(port, () => {
  console.log(`Pinger listening at: ${port}`);
})
