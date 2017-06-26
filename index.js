'use strict';

const os = require('os');
const http = require('http');
const fs = require('fs');
const path = require('path');
const url = require('url');
const qs = require('querystring');
const tessel = require('tessel');

// power off ports when not needed
tessel.close();

const wifi = tessel.network.wifi;

const templateStream = require('./template-stream');

const port = 80;

let foundNetworks = [];

const server = http.createServer((request, response) => {
  console.log(request.url);

  if (/public/.test(request.url)) {
    const assetPath = url.parse(request.url).pathname;
    const assetStream = fs.createReadStream(path.join(__dirname, assetPath));
    assetStream.pipe(response);
    return;
  }
   
  if (/networks/.test(request.url)) {
    wifi.findAvailableNetworks((error, networks) => {
      if (error) {
        response.writeHead(500, { "Content-Type": "application/json" });
        response.end(JSON.stringify({ message: error.message }));
        return;
      }

      foundNetworks = networks;
      response.writeHead(200, { "Content-Type": "application/json" });
      response.end(JSON.stringify(networks));
    });
    return;
  }

  if (/connect/.test(request.url)) {
    let body = '';

    request.on('data', (data) => body += data);

    request.on('end', () => {
      const post = qs.parse(body);
      const selectedNetwork = foundNetworks.find(network => network.ssid === post.ssid);

      const connectionOptions = Object.assign({security: 'none'}, selectedNetwork, post);
      wifi.connect(connectionOptions, (error, settings) => {
        if (error) {
          response.writeHead(500, { "Content-Type": "text/plain" });
          response.end(error.message);
          return;
        }
        response.writeHead(200, { "Content-Type": "text/plain" });
        response.end(JSON.stringify(settings));
      });
    });
    return;
  }

  console.log('getting the main page');

  const indexPageStream = fs.createReadStream(path.join(__dirname, 'public', 'index.html'));

  response.writeHead(200, { "Content-Type": "text/html" });
  indexPageStream
  .pipe(response);
})
.listen(port, () => {
  console.log(`Now serving at http://${os.hostname()}:${port}`);
});
