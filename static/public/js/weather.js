'use strict';

window.addEventListener('load', async () => {
  const { result } = await api.status();
  if (result !== 'logged') window.location = '/';
});

const button = document.querySelector('.form-btn');
const notify = document.querySelector('.notify');
const loadingDiv = document.querySelector('.loading');
const herokuUrl = 'https://cors-anywhere.herokuapp.com/';
const url = `https://www.metaweather.com/api/location/`;
const findIdUrl = `search/?query=`;
const cityInp = document.querySelector('.form-input');
const table = document.querySelector('.display-table');
const dateOptions = { weekday: 'long', month: 'numeric', day: 'numeric' };
let loading = false;
let notifying = false;
let index = 0;
let timer;

const getImg = imgAb =>
  `<img src='/public/images/weather/${imgAb}.png' alt='weather'/>`;

const makeTempColumns = dailyWeather => {
  let res = ``;
  dailyWeather.forEach(el => {
    const { min_temp, max_temp, the_temp } = el;
    res += `
    <div class='dayTemp'>
      <div class='tempTitles'>
        <span>Min</span>
        <span>Avg</span>
        <span>Max</span>
      </div>
      <div class='tempValues'>
        <span class='smd'>${Math.floor(min_temp)}</span>
        <span>${Math.floor(the_temp)}</span>
        <span class='smd'>${Math.floor(max_temp)}</span>
      </div>
    </div>`;
  });
  return res;
};

const makeWindColumns = dailyWeather => {
  let res = ``;
  dailyWeather.forEach(el => {
    const { wind_speed, wind_direction_compass } = el;
    res += `
    <div class='dayWind'>
      <div class='windSpeed'>
        <span>Speed:</span><span>${Math.floor(wind_speed)}</span>
      </div>
      <div class='windDir smd'>
        <span>Direction:</span><span>${wind_direction_compass}</span>
      </div>
    </div>`;
  });
  return res;
};

const stopLoading = () => {
  loading = false;
  loadingDiv.style.display = 'none';
};

const delNotifying_StartLoading = () => {
  if (notifying) {
    clearInterval(timer);
    index = 0;
    notify.innerText = '';
    notify.style.display = 'none';
    notifying = false;
  }
  if (!loading) {
    loading = true;
    table.innerHTML = '';
    loadingDiv.style.display = 'block';
  }
};

const typingText = () => {
  const notifySentence = "Sorry, but we can't get weather of this city. ";
  notify.innerText = notifySentence.slice(0, index);

  index++;

  if (index > notifySentence.length) {
    index = 0;
  }
};

const badHAPPENED = () => {
  stopLoading();
  notifying = true;
  table.innerHTML = '';
  notify.style.display = 'block';
  timer = setInterval(typingText, 100);
};

const createTable = weather => {
  const { title, country, time, dailyWeather } = weather;
  let days = ``;
  dailyWeather.forEach(el => {
    const { applicable_date: date, weather_state_abbr: imgAb } = el;
    const day = new Date(date).toLocaleDateString('en-EN', dateOptions);
    const img = getImg(imgAb);
    days += `
    <div class='dayImg'>
      <span class='dayDel'>${day.slice(0, -4)}</span>
      <span>${day.slice(-4)}</span>${img}
    </div>
  `;
  });
  const temp = makeTempColumns(dailyWeather);
  const dayWind = makeWindColumns(dailyWeather);
  const output = `
    <div class='header'>
      <div>${title}</div>
      <div class='coDel'>${country}</div>
      <div>${time}</div>
    </div>
    <div class='days'>${days}</div>
    <div class='tempHeader'>Temperature</div>
    <div class='temp'>${temp}</div>
    <div class='windHeader'>Wind</div>
    <div class='wind'>${dayWind}</div>    
  `;
  stopLoading();
  table.innerHTML = output;
  return;
};

const handleRequestGetWeather = ({ woeid }) => {
  fetch(herokuUrl + url + woeid, {
    method: 'GET',
  })
    .then(res => res.json())
    .then(data => {
      const {
        title,
        time,
        parent: { title: country },
        consolidated_weather: dailyWeather,
      } = data;
      createTable({
        title,
        time: new Date(time).toLocaleString(),
        country,
        dailyWeather,
      });
    });
};

const handleRequestGetId = () => {
  delNotifying_StartLoading();
  const city = cityInp.value;
  if (!city) return badHAPPENED();
  const query = city.split(' ').join('%20');
  fetch(herokuUrl + url + findIdUrl + query, {
    method: 'GET',
  })
    .then(res => res.json())
    .then(data => {
      if (!data.length) return badHAPPENED();
      return handleRequestGetWeather(data[0]);
    })
    .catch(() => badHAPPENED());
};

const animateButton = ev => {
  const x = ev.offsetX;
  const y = ev.offsetY;

  const ripples = document.createElement('span');
  ripples.style.left = x + 'px';
  ripples.style.top = y + 'px';
  button.appendChild(ripples);
  handleRequestGetId();

  setTimeout(() => {
    ripples.remove();
  }, 1000);
};

document.addEventListener('DOMContentLoaded', () => {
  button.addEventListener('click', animateButton);
  cityInp.onkeyup = ev => {
    if (ev.keyCode === 13) {
      handleRequestGetId();
    }
  };
});
