'use strict';

const Transform = require('stream').Transform;
const eachBlockRegex = /{{\s*#each\s*(.*)}}([\S\s]*?){{\s*\/each\s*}}/g;

module.exports = (data) => (
  new Transform({
    writableObjectMode: true,

    transform(chunk, encoding, callback) {
      let html = chunk.toString();

      // {{#each}}{{/each}} block support
      let eachBlock;
      while ((eachBlock = eachBlockRegex.exec(html)) !== null) {
        const prop = eachBlock[1];
        const template = eachBlock[2];

        const compiledBlock = data[prop].map((value) => {
          return template.replace(/{{\s*value\s*}}/g, value).trim();
        }).join('\n');

        html = html.replace(eachBlock[0], compiledBlock);
      }

      // simple templating support
      for (const prop in data) {
        const finder = new RegExp(`{{\\s*(${prop})\\s*}}`, 'g');
        html = html.replace(finder, data[prop]);
      }
      callback(null, html);
    },
  })
);
