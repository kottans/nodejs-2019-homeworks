'use strict';

const fs = require('fs');

function saveRecent (city) {
  const recent = readRecent();
  if (recent.indexOf(city) === -1) {
    recent.unshift(city);
    if (recent.lenght > 9) recent.pop();
    writeRecent(recent);
  }
}

function saveFavorite (city) {
  const favorite = readFavorite();
  const exists = favorite.find(c => c.name === city);
  if (exists) exists.count++;
  else {
    favorite.push({
      name: city,
      count: 1
    });
  }
  writeFavorite(favorite.sort((a, b) => a.count - b.count).reverse().slice(0, 10));
}

function readFavorite () {
  if (fs.existsSync('favorite.csv')) {
    const output = fs.readFileSync('favorite.csv').toString()
      .split('\n')
      .map(c => {
        const cData = c.split(';');
        return {
          name: cData[0],
          count: cData[1]
        };
      });
    return output;
  }

  return [];
}

function writeFavorite (favorite) {
  fs.writeFile('favorite.csv', favorite.map(c => {
    return `${c.name};${c.count}`;
  }).join('\n'), () => {});
}

function readRecent () {
  if (fs.existsSync('recent.csv')) {
    return fs.readFileSync('recent.csv').toString().split('\n');
  }
  return [];
}

function writeRecent (recent) {
  fs.writeFile('recent.csv', recent.join('\n'), () => {});
}

module.exports.saveCities = (city) => {
  saveRecent(city);
  saveFavorite(city);
};

module.exports.getRecent = readRecent;

module.exports.getFavourite = readFavorite;
