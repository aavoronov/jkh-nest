// import { readFileSync } from 'fs';
const { readFileSync } = require('fs');

function test() {
  var rawData = readFileSync('./src/utils/export-base_demo_fax8br.csv')
    .toString() // convert Buffer to string
    .split('\n') // split string to lines
    .map((e) => e.trim()) // remove white spaces for each line
    .map((e) =>
      e
        .split(';')
        .map((e, index) => {
          return index === 1 || index === 3
            ? e.trim().split(',')[0]
            : index === 4
            ? e.trim().split(' ')
            : e.trim();
        })
        .flat(),
    ); // split each line to array

  //   rawData.map((i, index) => i[1].split(',')[0]);

  //   rawData.forEach((i) => '')

  //   console.log(rawData);
  //   console.log(JSON.stringify(data, '', 2)); // as json
  //   console.log('test');
  return rawData;
}

module.exports = { test };
