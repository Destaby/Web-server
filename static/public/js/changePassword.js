import { getApi } from './general/loader.js';
const load = ['confirmLastPassword', 'changePassword'];

const formLast = document.getElementById('last');
const formChange = document.getElementById('change');
const passwordLastInput = document.querySelector(
  '#last input[name="password"]'
);
const passwordInput = document.querySelector('#change input[name="password"]');
const password_confInput = document.querySelector(
  '#change input[name="password_conf"]'
);
const notify = document.querySelectorAll('.notify');
const head = document.getElementById('forWhat');

async function formLastListener(e) {
  e.preventDefault();
  const password = passwordLastInput.value;
  const sure = await api.confirmLastPassword(password);
  if (sure) {
    formLast.remove();
    formChange.addEventListener('submit', formChangeListener);
    notify[0].style.display = 'none';
    head.innerText = 'Change Password';
    formChange.style.display = 'grid';
    return;
  }
  notify[0].innerText = 'Wrong password';
  notify[0].style.display = 'block';
  passwordLastInput.value = '';
}

async function formChangeListener(e) {
  e.preventDefault();
  const password = passwordInput.value;
  const password_conf = password_confInput.value;
  if (password === password_conf) {
    const { result } = await api.changePassword(password);
    if (result === 'success') window.location = '/';
  } else {
    notify[1].innerText = 'Passwords should match';
    notify[1].style.display = 'block';
    passwordInput.value = '';
    password_confInput.value = '';
  }
}

window.addEventListener('load', async () => {
  const cpApi = await getApi(load);
  window.api = { ...api, ...cpApi };
  const { result } = await api.status();
  if (result !== 'logged') return (window.location = '/');

  formLast.addEventListener('submit', formLastListener);
});
