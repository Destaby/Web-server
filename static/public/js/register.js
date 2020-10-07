import { getApi } from './general/loader.js';
const load = ['registerUser', 'status'];
const special = ['signIn'];
(async () => {
  window.api = await getApi(load, special);
  const { result } = await api.status();
  if (result === 'logged') window.location = '/';
})();

window.addEventListener('load', async () => {
  const form = document.querySelector('form');
  const notify = document.querySelector('.notify');
  const nameInput = document.querySelector('input[name="fullName"]');
  const loginInput = document.querySelector('input[name="login"]');
  const emailInput = document.querySelector('input[name="email"]');
  const passwordInput = document.querySelector('input[name="password"]');
  const password_confInput = document.querySelector(
    'input[name="password_conf"]'
  );

  const exist = arg => {
    notify.innerText = `User with the same ${arg} already exists.
    Please, enter another ${arg}`;
    notify.style.display = 'block';
    nameInput.value = '';
    loginInput.value = '';
    emailInput.value = '';
    passwordInput.value = '';
    password_confInput.value = '';
  };

  form.addEventListener('submit', async e => {
    notify.style.display = 'none';
    e.preventDefault();
    const fullName = nameInput.value;
    const login = loginInput.value;
    const email = emailInput.value;
    const password = passwordInput.value;
    const password_conf = password_confInput.value;
    if (password === password_conf) {
      const insert = await api.registerUser({
        fullName,
        login,
        email,
        password,
      });
      const { denied } = insert;
      if (denied) return exist(denied);
      const res = await api.signIn({ login, password });
      if (res.result === 'success') window.location = '/';
    } else {
      notify.innerText = 'Passwords should match';
      notify.style.display = 'block';
      passwordInput.value = '';
      password_confInput.value = '';
    }
  });
});
