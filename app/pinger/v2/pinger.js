// Pinger checks list of URLs
// Returns the status, latency
const axios = require('axios');
const crypto = require('crypto');

// {'urlHash: {'url': 'https://foo.bar', 'total':1, 'success': 1, 'latency': 999, 'statusCode': 200}}
let pingState = {};

axios.interceptors.request.use(a => {
  a.meta = a.meta || {};
  a.meta.startTime = new Date().getTime();
  return a;
})

axios.interceptors.response.use(a => {
  let endTime = new Date().getTime();
  a.config.meta.endTime = endTime;
  a.config.meta.latency = endTime - a.config.meta.startTime;
  return a
})

const hash = (txt) => crypto.createHash('sha256').update(txt).digest('hex');

var log = console.log;
console.log = function(){
  let first = arguments[0];
  let rest = Array.prototype.slice.call(arguments, 1);
  log.apply(console, [(new Date().toISOString()) + ' | ' + first].concat(rest));
};

const ping = (urls) => {
  console.log(`Starting pings...`);
  for (let u of urls) {
    console.log(`Checking URL: ${u}`);
    axios.get(u).then(response => {
      console.log(`Execution time for: ${u} - ${response.config.meta.latency} ms. Status: ${response.status}`);
      mutatepingState(u, response.config.meta.latency, response.status, response.data.length);
    })
      .catch(error => {
        console.log(`Error calling URL: ${u}. Code: ${error.code}`);
        if(!error.code)
          mutatepingState(u, 0, error.response.status, 0);
        else
          mutatepingState(u, 0, error.code, 0);
      });
    console.log(`State: ${JSON.stringify(pingState, null, 4)}`);
  }
}

const mutatepingState = (url, latency, statusCode, reponseSize) => {
  let s = pingState[hash(url)];
  if(s == undefined) {
    s = {'url': url, 'total': 0, 'success': 0, 'latency': 0, 'statusCode': 0, 'reponseSize': 0}
  }
  if(statusCode === 200) {
    s.success += 1;
  }
  s.total += 1;
  s.latency = latency;
  s.statusCode = statusCode;
  s.reponseSize = reponseSize;
  pingState[hash(url)] = s;
}

exports.ping = ping;
exports.pingState = pingState;
