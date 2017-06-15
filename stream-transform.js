'use strict';

const Transform = require('stream').Transform;

module.exports = (data = {}) => (
  new Transform({
    writableObjectMode: true,

    transform(chunk, encoding, callback) {
      let html = chunk.toString();

      for (const prop in data) {
        const finder = new RegExp(`{{\\s*(${prop})\\s*}}`, 'g');
        html = html.replace(finder, data[prop]);
      }
      callback(null, html);
    },
  })
);
