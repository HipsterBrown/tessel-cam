'use strict';

const av = require('tessel-av');
const os = require('os');
const http = require('http');
const fs = require('fs');
const path = require('path');
const templateStream = require('./stream-template');

const port = 9001;

const camera = new av.Camera({
  fps: 30,
  height: 600,
  width: 800,
});

const server = http.createServer((request, response) => {
  if (/capture/.test(request.url)) {
    console.log('capturing photo...');

    response.writeHead(200, { "Content-Type": "image/jpeg" });
    camera.capture().pipe(response);
    return;
  }

  console.log('getting the main page');

  const indexPageStream = fs.createReadStream(path.join(__dirname, 'index.html'));

  response.writeHead(200, { "Content-Type": "text/html" });
  indexPageStream
  .pipe(templateStream({
    cameraURL: camera.url,
    nodeVersion: process.versions.node,
  }))
  .pipe(response);
}).listen(port, () => {
  console.log(`Now serving at http://${os.hostname()}:${port}`);
  console.log(camera.url);
});