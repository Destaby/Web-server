'use strict';

const daysEl = document.getElementById('days');
const hoursEl = document.getElementById('hours');
const minsEl = document.getElementById('mins');
const secondsEl = document.getElementById('seconds');

let nextYear = new Date().getFullYear() + 1;
let newYears = '1 Jan ' + nextYear;

const formatTime = time => (time < 10 ? `0${time}` : time);

const countdown = () => {
  const newYearsDate = new Date(newYears);
  const currentDate = new Date();

  const totalSeconds = (newYearsDate - currentDate) / 1000;

  const days = Math.floor(totalSeconds / 3600 / 24);
  const hours = Math.floor(totalSeconds / 3600) % 24;
  const mins = Math.floor(totalSeconds / 60) % 60;
  const seconds = Math.floor(totalSeconds) % 60;

  daysEl.innerHTML = days;
  hoursEl.innerHTML = formatTime(hours);
  minsEl.innerHTML = formatTime(mins);
  secondsEl.innerHTML = formatTime(seconds);

  if (!days && !hours && !mins && !seconds) {
    nextYear++;
    newYears = '1 Jan ' + nextYear;
  }
};

window.addEventListener('load', async () => {
  const { result } = await api.status();
  if (result !== 'logged') window.location = '/';

  setInterval(countdown, 1000);
});
