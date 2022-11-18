const express = require('express');
const path = require('path');
const morgan = require('morgan');
const axios = require('axios');
const app = express();
const port = 9000;

app.use(morgan(':remote-addr - :remote-user [:date[clf]] ":method :url ' +
  'HTTP/:http-version" :status :res[content-length] ":referrer" ":user-agent"'));

app.use(express.json());

var log = console.log;
console.log = function () {
  let first = arguments[0];
  let rest = Array.prototype.slice.call(arguments, 1);
  log.apply(console, [(new Date().toISOString()) + ' | ' + first].concat(rest));
};

const pingerBaseUrl = process.env.PINGER_BASE_URL || 'http://localhost:3000';
const detailsBaseUrl = process.env.DETAILS_BASE_URL || 'http://localhost:4000';

const getApiCall = (url) => {
  console.log(`Calling API: ${url}`);
  return axios.get(url).then(response => {
    return response.data;
  })
    .catch(error => {
      console.log(`Error calling API: ${url}. Code: ${error.code}`);
      return {'error': error.code};
    })
}

const postApiCall = (url, data) => {
  console.log(`Calling API: ${url}`);
  return axios.post(url, data).then(response => {
    return response.data;
  })
    .catch(error => {
      console.log(`Error calling API: ${url}. Code: ${error.code}`);
      return {'error': error.code};
    })
}

const sendResponse = (res, data) => {
  if (data.error) {
    res.status(500);
  }
  res.json(data);
}

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, './index.html'));
})

app.get('/ping/stats', (req, res) => {
  getApiCall(pingerBaseUrl + '/ping/stats')
    .then(data => {
      sendResponse(res, data);
    })
})

app.get('/ping/urls', (req, res) => {
  getApiCall(pingerBaseUrl + '/ping/urls')
    .then(data => {
      sendResponse(res, data);
    })
})

app.post('/ping/updateUrl', (req, res) => {
  postApiCall(pingerBaseUrl + '/ping/updateUrl', req.body)
    .then(data => {
      sendResponse(res, data);
    })
})

app.post('/url/info', (req, res) => {
  postApiCall(detailsBaseUrl + '/url/info', req.body)
    .then(data => {
      sendResponse(res, data);
    })
})

app.listen(port, () => {
  console.log(`Frontend listening at: ${port}`);
})
