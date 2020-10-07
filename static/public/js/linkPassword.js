import { getApi } from './general/loader.js';
const load = ['status', 'linkPasswordChange', 'checkLink'];

const { href } = window.location;
const form = document.querySelector('form');
const passwordInput = document.querySelector('input[name="password"]');
const password_confInput = document.querySelector(
  'input[name="password_conf"]'
);
const notify = document.querySelector('.notify');

const expired = () => {
  notify.innerText = 'Sorry, but the link has expired';
  notify.style.display = 'block';
  passwordInput.value = '';
  password_confInput.value = '';
  setTimeout(() => (window.location = '/login'), 3000);
};

window.addEventListener('load', async () => {
  window.api = await getApi(load);
  const { result } = await api.status();
  if (result === 'logged') window.location = '/';
  const ok = await api.checkLink(href);
  if (!ok) window.location = '/';

  form.addEventListener('submit', async e => {
    e.preventDefault();
    const password = passwordInput.value;
    const password_conf = password_confInput.value;
    if (password === password_conf) {
      const res = await api.linkPasswordChange({ password, href });
      if (res && res.result === 'success') return (window.location = '/login');
      expired();
    } else {
      notify.innerText = 'Passwords should match';
      notify.style.display = 'block';
      passwordInput.value = '';
      password_confInput.value = '';
    }
  });
});
