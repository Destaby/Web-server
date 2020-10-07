'use strict';

const userLogged = () => {
  const notAllowedApps = document.querySelectorAll('.notAllowed');
  for (const el of notAllowedApps) {
    el.addEventListener('click', () => (window.location = el.dataset.name));
    el.classList.remove('notAllowed');
    el.classList.add('allowed');
  }
};

window.addEventListener('load', async () => {
  const { result } = await api.status();
  if (result === 'logged') userLogged();
});

window.sr = ScrollReveal();
const options = orig => ({
  distance: '180%',
  origin: orig,
  delay: 200,
  duration: 800,
  easing: 'ease-in',
  reset: true,
});
sr.reveal('.img', options('left'));
