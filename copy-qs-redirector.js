/**
 * トランスパイル済みのJavScriptをサンプルのディレクトリにコピーする
 */
const fs = require('fs');
const path = require('path');

const src = './dist';
const dist = './sample/js';
const filename = 'qs-redirector.js';

fs.readFile(path.join(src, filename), 'utf8', (err, data) => {
  if (err) {
    throw new Error(err);
  }

  const result = data;

  fs.writeFile(path.join(dist, filename), result, 'utf8', (errW) => {
    if (errW) {
      throw new Error(err);
    }
  });
});
