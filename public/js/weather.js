const button = document.querySelector('.form-btn');
const appId = '2e8e6419b6b7803fa062c846a556aede';
const url = `http://api.weatherstack.com/current?access_key=${appId}`;
const cityInp = document.querySelector('.form-input');
const header = document.querySelector('.header');
const row = document.querySelector('.table-row');
let headerRow = ``;
const headerValues = [
  'City',
  'Country',
  'Localtime',
  'Temperature',
  'Weather',
  'Wind Direction',
  'Wind Speed',
  'Cloud Cover',
  'Humidity',
].forEach(el => {
  const col = `<div>${el}</div>`;
  headerRow += col;
});

const badHAPPENED = () => {
  header.innerHTML = `<h2 class="sorry">Sorry, but we can't get weather of this city.</h2>
  <h2 class="sorry">Please, write city name correctly!</h2>`;
  row.innerHTML = '';
};

const handleRequest = () => {
  const city = cityInp.value;
  if (!city) return badHAPPENED();
  const query = city.split(' ').join('%20');
  httpRequest(reqListener, `${url}&query=${query}`);
};

const createTable = weather => {
  header.innerHTML = headerRow;
  let output = ``;
  const { localtime, name, country } = weather.location;
  const {
    cloudcover,
    humidity,
    temperature,
    weather_descriptions,
    wind_dir,
    wind_speed,
  } = weather.current;
  const rowValues = [
    name,
    country,
    localtime,
    temperature,
    weather_descriptions[0],
    wind_dir,
    wind_speed,
    cloudcover,
    humidity,
  ].forEach(el => {
    const col = `<div>${el}</div>`;
    output += col;
  });
  row.innerHTML = output;
};

const animateButton = ev => {
  const x = ev.offsetX;
  const y = ev.offsetY;

  const ripples = document.createElement('span');
  ripples.style.left = x + 'px';
  ripples.style.top = y + 'px';
  button.appendChild(ripples);
  handleRequest();

  setTimeout(() => {
    ripples.remove();
  }, 1000);
};

function httpRequest(fn, url) {
  const onReq = new XMLHttpRequest();
  onReq.addEventListener('load', fn);
  onReq.onreadystatechange = () => {
    if (onReq.readyState === XMLHttpRequest.DONE) {
      if (onReq.status !== 200) {
        badHAPPENED();
      }
    }
  };
  onReq.open('GET', url);
  onReq.send();
}

function reqListener() {
  const response = JSON.parse(this.responseText);
  if (response.error) return badHAPPENED();
  createTable(response);
}

document.addEventListener('DOMContentLoaded', () => {
  button.addEventListener('click', animateButton);
  cityInp.onkeyup = ev => {
    if (ev.keyCode === 13) {
      handleRequest();
    }
  };
});
