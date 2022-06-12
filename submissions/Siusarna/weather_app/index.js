const request = require('request-promise-native');
const fs = require('fs');
const readline = require('readline');

const args = process.argv;
const pathToExistingCities = './data/ExistingCities.txt';
const pathToFavoriteCities = './data/FavoriteCities.txt';
const help = `
  Simple weather application
This script takes 2 parameters:
    --l(--location)     Parameter which defines the city where you want see forecast
               City must be specified after the parameter.
               If you start the program without providing any location, last successful query will be repeated.
               It can be specified as name of city or as latitude&longitude.
               Longitude can be from -180 to 180.
               Latitude can be from -90 to 90. First latitude then longitude with ',' beetween them.
               Example: node index.js --l=Kyiv
               Example: node index.js --l=50.45,30.52
    --r(--range)     Parameter which specifies forecast period.
               Range must be specified after the parameter.
               It can be specified as 'day' or 'week'.
               Default value = day.
               Example: node index.js --range=week
    --u(--units)     Parameter which defines the units of temperature
               Units must be specified after the parameter.
               It can be specified as 'Celsius' or 'Fahrenheit'.
               Defaul value = 'Celsius'.
    --f(--favorite)     Parameter that display list of your favorite cities.
               If you set some city, this city will write in list of favorite cities and display forecast for this city.
    --h(--history)     Parameter that display list of recently viewed cities.
    --help     Parameter will show this instructions.
`;

const parseArgs = () => {
  const objWithInputData = {};
  for (const value of args) {
    if (value.includes('--r')) {
      objWithInputData.range = value.split('=')[1];
    }
    if (value.includes('--l')) {
      objWithInputData.location = value.split('=')[1];
    }
    if (value.includes('--u')) {
      objWithInputData.units = value.split('=')[1];
    }
    if (value.includes('--f')) {
      objWithInputData.favoriteFlag = value.split('=')[0];
      objWithInputData.favoriteValue = value.split('=')[1];
    }
    if (value.includes('--h')) {
      objWithInputData.flagAboutRecently = true;
    }
    if (value.includes('--help')) {
      objWithInputData.flagAboutHelp = true;
    }
  }
  return objWithInputData;
};

const writeCityNameToFile = (cityName, path) => {
  const options = { flag: 'a' };
  const dataForWriting = cityName + '\n';
  fs.writeFile(path, dataForWriting, options, (err) => {
    if (err) {
      throw new Error(err);
    }
  });
};

const processingResponceData = (body) => {
  body = JSON.parse(body);
  writeCityNameToFile(body.name, pathToExistingCities);
  return body;
};

const processingRange = (range) => {
  if (range === 'week') {
    return 'forecast';
  }
  return 'weather';
};

const createUrl = (city, range, units) => {
  const apiKey = 'a5648b4f5b2e2989f059b602887ada85';
  let url = 'https://api.openweathermap.org/data/2.5/';
  const baseQuery = `?appid=${apiKey}`;
  const queryForUnits = `units=${units}`;
  let location = '';
  if (Array.isArray(city)) {
    location = `lat=${city[0]}&lon=${city[1]}`;
  } else {
    location = `q=${city}`;
  }
  url += range + baseQuery + `&${queryForUnits}` + `&${location}`;
  return url;
};

const readLastCityFromFile = () => {
  try {
    const allExistingCities = fs.readFileSync(pathToExistingCities, 'utf8');
    const arrayOfExistingCities = allExistingCities.split('\n');
    const indexOfSecondLastElement = arrayOfExistingCities.length - 2; // second last because last element = ''
    return arrayOfExistingCities[indexOfSecondLastElement];
  } catch {}
};

const takeCityFromUser = async () => {
  const consoleInterface = readline.createInterface({
    input: process.stdin,
    output: process.stdout
  });
  const question = 'Please enter location: ';
  return new Promise((resolve, reject) => {
    consoleInterface.question(question, (input) => {
      consoleInterface.close();
      resolve(input);
    });
  });
};

const isCoordiate = (location) => {
  return location.split(',').length === 2;
};

const processingLocation = async (location) => {
  if (location) {
    if (isCoordiate(location)) {
      const arrWithCoordinate = location.split(',');
      return arrWithCoordinate;
    }
    return location;
  }
  location = readLastCityFromFile(); // this function can return last city or undefined (if file does not exist)
  if (!location) {
    location = await takeCityFromUser();
  }
  return location;
};

const processingError = (err) => {
  if (err.statusCode === 404) {
    console.log('Nothing found. Please enter a different location');
    process.exit(1);
  } else {
    throw new Error(err);
  }
};

const processingUnits = (units) => {
  let unitsForApi = 'metric';
  if (units === 'Fahrenheit') {
    unitsForApi = 'imperial';
  }
  return unitsForApi;
};

const processingFavorite = (flag, value) => {
  if (!flag) {
    return;
  }
  try {
    console.log('List of your favorite cities');
    const favoriteCities = fs.readFileSync(pathToFavoriteCities, 'utf8');
    console.log(favoriteCities);
  } catch {
    console.log('');
  }
  if (value) {
    writeCityNameToFile(value, pathToFavoriteCities);
  }
};

const processingRecently = (flag) => {
  if (flag) {
    console.log('List of your recently cities');
    const resentlyCities = fs.readFileSync(pathToExistingCities, 'utf8');
    console.log(resentlyCities);
  }
};

const processingHelp = (flag) => {
  if (flag) {
    console.log(help);
  }
};

const processingInputData = async (objWithInputData) => {
  const {
    location,
    range,
    units,
    favoriteFlag,
    favoriteValue,
    flagAboutRecently,
    flagAboutHelp
  } = objWithInputData;
  processingFavorite(favoriteFlag, favoriteValue);
  processingRecently(flagAboutRecently);
  processingHelp(flagAboutHelp);
  const unitsForApi = processingUnits(units);
  const rangeForApi = processingRange(range);
  const locationForApi = await processingLocation(location);
  return createUrl(locationForApi, rangeForApi, unitsForApi);
};

const chooseColorForTemp = (temp) => {
  if (temp >= 5 && temp <= 20) {
    return `\x1b[33m${temp}\x1b[0m`;
  } else if (temp > 20) {
    return `\x1b[31m${temp}\x1b[0m`;
  } else if (temp < 5) {
    return `\x1b[34m${temp}\x1b[0m`;
  }
};

const processingTemp = (date, temp) => {
  const dateInSecond = date * 1000; // the argument is in milliseconds, not seconds.
  const dateForPrint = new Date(dateInSecond);
  const tempWithColor = chooseColorForTemp(temp);
  console.log(dateForPrint.toUTCString());
  console.log('Temp: ', tempWithColor);
};

const displayForWeek = (data) => {
  for (const part of data.list) {
    processingTemp(part.dt, part.main.temp);
  }
};

const displayForDay = (data) => {
  processingTemp(data.dt, data.main.temp);
};

const displayWeather = (data) => {
  if (data.list) {
    displayForWeek(data);
  } else {
    displayForDay(data);
  }
};

const weatherApp = async () => {
  const objWithInputData = parseArgs();
  const url = await processingInputData(objWithInputData);
  request(url)
    .then((responce) => {
      const weatherData = processingResponceData(responce);
      displayWeather(weatherData);
    })
    .catch((err) => {
      processingError(err);
    });
};

weatherApp();
