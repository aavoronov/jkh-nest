// import { readFileSync } from 'fs';
const { readFileSync } = require('fs');

function test(file) {
  var rawData = readFileSync(`./src/utils/${file}.csv`)
    .toString() // convert Buffer to string
    .split('\n') // split string to lines
    .map((e) => e.trim()) // remove white spaces for each line
    .map((e) =>
      e
        .split(';')
        .map((e, index) => {
          if (index === 1 || index === 2 || index === 4) {
            // console.log(e.trim().split(',')[0]);
            return e.trim().split(',')[0];
          }
          if (index === 5) {
            // console.log(e.trim().split(' '));
            return e.trim().split(' ');
          }
          if (index === 0 || index === 3 || index === 6) {
            // console.log(e.trim());
            return e.trim();
          }
        })
        .flat(),
    ); // split each line to array

  //   rawData.map((i, index) => i[1].split(',')[0]);

  //   rawData.forEach((i) => '')

  // console.log(rawData);
  //   console.log(JSON.stringify(data, '', 2)); // as json
  //   console.log('test');
  return rawData;
}

module.exports = { test };
