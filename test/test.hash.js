const tape = require('tape');
const HashTask = require('../hash.js');
const fs = require('fs');
const path = require('path');

fs.readdirSync('test/scripts').forEach((filename) => {
  fs.unlinkSync(path.join(__dirname, 'scripts', filename));
});

tape('hashes files', (t) => {
  const task = new HashTask('hash', {}, {});
  const hashed1 = task.hasher('nothing.css', 'some content').split('.');
  t.equal(hashed1.length, 3);
  t.equal(typeof parseInt(hashed1[1], 0), 'number');
  const hashed2 = task.hasher('nothing.css', 'some different content').split('.');
  t.equal(hashed2.length, 3);
  t.notEqual(hashed1[1], hashed2[1]);
  t.end();
});

tape('renames files', (t) => {
  fs.writeFile('test/scripts/input.js', `
  const x = 5;
  console.log('there there');
  `, () => {
    const task = new HashTask('hash', {}, {});
    const input = 'test/scripts/*';
    task.process(input, '', (err, map) => {
      t.equal(err, null);
      const tokens = map.fileHashes['test/scripts/input.js'].split('.');
      t.equal(tokens.length, 3);
      t.equal(typeof parseInt(tokens[1], 0), 'number');
      t.end();
    });
  });
});

tape('writes mapping file', (t) => {
  const input = 'test/scripts/*';
  const files = {};
  files[input] = '';
  fs.writeFile(path.join(__dirname, 'scripts', 'input.js'), `
  const x = 5;
  console.log('there there');
  `, () => {
    const task = new HashTask('hash', {
      files,
      mappingFile: path.join(__dirname, 'scripts', 'map.json')
    }, {});
    task.execute((err, result) => {
      t.equal(err, null);
      fs.exists('test/scripts/map.json', (exists) => {
        t.equal(exists, true);
        t.end();
      });
    });
  });
});
