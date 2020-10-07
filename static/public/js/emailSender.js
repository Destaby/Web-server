import { getApi } from './general/loader.js';
const load = ['status', 'sendLinkToEmail'];

const form = document.querySelector('form');
const emailInput = document.querySelector('input[name="email"]');
const emailParagraph = document.querySelector('.inputEmail');
const btnParagraph = document.querySelector('.full');
const header = document.querySelector('h3');
const notify = document.querySelector('.notify');
const { href } = window.location;

const emailSent = () => {
  emailParagraph.remove();
  notify.remove();
  header.innerText =
    'Check your email for a link to reset your password. If it doesn’t appear within a few minutes, check your spam folder.';
  form.removeEventListener('submit', formListener);
  btnParagraph.innerHTML = `<button type='submit'>Return to sign in</button>`;
  form.addEventListener('submit', e => {
    e.preventDefault();
    window.location = '/login';
  });
};

const emailNotExist = () => {
  notify.innerText = `User with this email doesn't exist`;
  notify.style.display = 'block';
  emailInput.value = '';
};

async function formListener(e) {
  e.preventDefault();
  const email = emailInput.value;
  const res = await api.sendLinkToEmail({ email, href });
  if (!res) return emailNotExist();
  emailSent();
}

window.addEventListener('load', async () => {
  window.api = await getApi(load);
  const { result } = await api.status();
  if (result === 'logged') window.location = '/';
  form.addEventListener('submit', formListener);
});
