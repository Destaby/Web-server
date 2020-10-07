import { getApi } from './loader.js';
const load = ['status', 'getUserInfo'];
const special = ['deleteUser'];
(async () => {
  window.api = await getApi(load, special);
  const { result } = await api.status();
  if (result === 'logged') {
    const { name } = await api.getUserInfo();
    userLogged(name);
  } else {
    notLogged();
  }
})();

const navLinks = document.querySelector('.nav-links');
const navHeader = document.querySelector('.nav-header');
const navTitle = document.querySelector('.nav-title');

const deleteUser = async () => {
  await api.deleteUser();
};

const createNameView = name => {
  const view = document.createElement('div');
  view.innerText = name;
  view.classList.add('nav-name');
  navHeader.appendChild(view);
};

function userLogged(name) {
  navTitle.style.display = 'none';
  createNameView(name.slice(0, 12));
  const changePassword = document.createElement('a');
  const exit = document.createElement('a');
  exit.setAttribute('href', '/');
  changePassword.setAttribute('href', '/changePassword');
  changePassword.setAttribute('id', 'changePassword');
  exit.addEventListener('click', deleteUser);
  exit.innerText = 'Exit';
  changePassword.innerText = 'Change password';
  navLinks.appendChild(changePassword);
  navLinks.appendChild(exit);
}

function notLogged() {
  const links = `
    <a href="/register">Register</a>
    <a href="/login">Login</a>
  `;
  navLinks.innerHTML += links;
}
