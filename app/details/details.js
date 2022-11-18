// Get details for a URL
const axios = require('axios');

var log = console.log;
console.log = function(){
  let first = arguments[0];
  let rest = Array.prototype.slice.call(arguments, 1);
  log.apply(console, [(new Date().toISOString()) + ' | ' + first].concat(rest));
};

const fetchUrlInfo = (url) => {
  return axios.get(url).then(response => {
    console.log(`Fetching details for: ${url}`);
    return {
      'url': url,
      'status': response.status,
      'contentType': response.headers['content-type'],
      'server': response.headers.server,
      'data': response.data
    };
  })
    .catch(error => {
      console.log(`Error calling URL: ${url}. Code: ${error.code}`);
      let res = {
        'url': url,
        'error': error.code
      };
      if(error.response) {
        res.status = error.response.status;
      } else {
        res.status = -1;
      }
    });
}

exports.fetchUrlInfo = fetchUrlInfo;