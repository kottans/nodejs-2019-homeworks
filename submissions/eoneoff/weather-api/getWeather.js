'use strict';

const axios = require('axios');

const weather = axios.create({
  baseURL: 'http://api.openweathermap.org/data/2.5/',
  params: {
    APPID: 'c4ad7974f3977f8f388a60b5c0267caa'
  }
});

module.exports.getWeather = async function (mode, location, units) {
  const data = (await weather.get(mode, {
    params: {
      q: location,
      units: units
    }
  })).data;
  const wData = [];
  if (mode === 'weather') {
    const dData = makeWeatherData(data);
    dData.city = data.name;
    wData.push(dData);
  } else {
    for (const day of data.list) {
      const dData = makeWeatherData(day);
      dData.city = data.city.name;
      wData.push(dData);
    }
  }
  return wData;
};

function makeWeatherData (data) {
  const day = {
    icon: '_' + data.weather[0].icon,
    date: new Date(data.dt * 1000),
    description: data.weather[0].description,
    temp: data.main.temp,
    maxTemp: data.main.temp_max,
    minTemp: data.main.temp_min,
    wind: {
      deg: data.wind.deg,
      speed: data.wind.speed
    }
  };
  return day;
}
