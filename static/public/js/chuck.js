import { getApi } from './general/loader.js';
const load = ['getJokes', 'insertJokes'];

let prevState = [];
const categoryOnClick = new Set();
const favourites = new Set();
const used = new Set();
const favourSet = new Set();
const onGet = {
  Ran: onGetRan,
  From: onGetCat,
  Sear: onGetSearch,
};
const ident = {
  Ran: false,
  From: false,
  Sear: false,
};
const metods = {
  Ran: () => undefined,
  From: () => {},
  Sear: () => {},
};

const userLogged = async () => {
  const res = await api.getJokes();
  if (res && res.data) {
    const { data } = res;
    data.forEach(el => onGetSearch(el.joke, false));
  }

  window.addEventListener('beforeunload', async () => {
    const arrOfFav = [];
    for (const el of favourSet.values()) {
      arrOfFav.push(el.children[3].textContent);
    }
    await api.insertJokes(arrOfFav);
  });
};

window.addEventListener('load', async () => {
  const chuckApi = await getApi(load);
  window.api = { ...api, ...chuckApi };
  const { result } = await api.status();
  if (result !== 'logged') window.location = '/';

  await userLogged();
});

function httpRequest(fn, url) {
  const onReq = new XMLHttpRequest();
  onReq.addEventListener('load', fn);
  onReq.onreadystatechange = () => {
    if (onReq.readyState === XMLHttpRequest.DONE) {
      if (onReq.status !== 200) {
        const body = document.querySelector('body');
        body.innerText = `Error code: ${onReq.status}
          Cannot get a joke
          Try to connect to server later`;
      }
    }
  };
  onReq.open('GET', url);
  onReq.send();
}

function reqListener() {
  metods['From'] = onCategoriesWrap(this.responseText);
}

document.addEventListener('DOMContentLoaded', () => {
  const menuButtons = document.querySelectorAll('.menu');
  menuButtons.forEach(el => el.addEventListener('click', onClick));
  httpRequest(reqListener, 'https://api.chucknorris.io/jokes/categories');
  metods['Sear'] = onSearchWrap();
  preventer();
});

function catOnClick(event) {
  const { color } = event.target.style;
  if (color !== 'rgb(51, 51, 51)') {
    event.target.style.backgroundColor = '#F8F8F8';
    event.target.style.color = '#333333';
    categoryOnClick.add(event.target.innerText);
  } else {
    event.target.style.backgroundColor = '#FFFFFF';
    event.target.style.color = '#ABABAB';
    categoryOnClick.delete(event.target.innerText);
  }
}

// create div element that contains all categories

function onCategoriesWrap(arr) {
  const array = JSON.parse(arr);
  const before = document.getElementById('Sear');
  const block = document.createElement('DIV');
  block.setAttribute('id', 'onCat');
  for (const category of array) {
    const btn = document.createElement('BUTTON');
    btn.innerText = category;
    btn.classList.add('category');
    btn.addEventListener('click', catOnClick);
    block.appendChild(btn);
  }
  return () => {
    ident['From']
      ? block.remove()
      : before.parentElement.insertBefore(block, before);
  };
}

// this function turns button's state

function onClick(e) {
  let { id } = e.target;
  if (!id) id = e.target.parentElement.id;
  const curr = document.getElementById(id);

  const el = curr.children[0];

  if (!ident[id]) {
    el.style.visibility = 'visible';
    curr.style.borderColor = '#333333';
    metods[id]();
    for (const key in ident) {
      if (ident[key]) onClick({ target: { id: key } });
    }
  } else {
    el.style.visibility = 'hidden';
    curr.style.borderColor = '#ABABAB';
    metods[id]();
  }
  ident[id] = !ident[id];
}

// to remove the favourite joke when 'heart' button is clicked

function butToRemove() {
  const text = this.parentElement.children[3].textContent;
  const buttons = document.getElementById('buttons');
  for (let i = 0; i < buttons.children.length; i++) {
    const el = buttons.children[i];
    const joke = el.children[3];
    if (joke && joke.textContent === text) {
      const i = findIndex();
      const button = el.children[i];
      button.click();
    }
  }
  this.parentElement.remove();
  favourSet.forEach(el => {
    if (el.children[3].textContent === text) favourSet.delete(el);
  });
}

// create favourite joke

function createFavourites() {
  const divFav = document.getElementById('FavJokes');
  for (const el of used.values()) {
    if (!favourites.has(el)) {
      const text = el.children[3].textContent;
      favourSet.forEach(arg => {
        if (arg.children[3].textContent === text) {
          arg.remove();
          used.delete(el);
          favourSet.delete(arg);
        }
      });
    }
  }
  for (const el of favourites.values()) {
    if (used.has(el)) continue;
    used.add(el);
    const proto = el.cloneNode(true);
    proto.classList.add('protoEl');
    const i = findIndex();
    const button = proto.children[i];
    button.addEventListener('click', butToRemove);
    favourSet.add(proto);
    divFav.appendChild(proto);
  }
}

// process onclick event on 'heart' button of joke

function favOnClick(event) {
  let flag = false;
  const joke = event.target.parentElement;
  if (event.target.alt === 'notLiked') {
    event.target.src = '../../public/images/liked.png';
    event.target.alt = 'liked';
    favourites.forEach(el => {
      if (el.children[3].textContent === joke.children[3].textContent) {
        favourites.delete(el);
        used.delete(el);
        flag = true;
      }
    });
    if (flag) {
      favourites.add(joke);
      used.add(joke);
      return;
    }
    favourites.add(joke);
    createFavourites();
  } else {
    event.target.src = event.target.src = '../../public/images/notLiked.png';
    event.target.alt = 'notLiked';
    favourites.delete(joke);
    createFavourites();
  }
}

function createLikeButton() {
  const favBtn = document.createElement('IMG');
  favBtn.alt = 'notLiked';
  favBtn.src = '../../public/images/notLiked.png';
  favBtn.addEventListener('click', favOnClick);
  favBtn.classList.add('favBtn');
  return favBtn;
}

function isFavourite(joke) {
  const text = joke.children[3].textContent;
  favourSet.forEach(el => {
    if (el.children[3].textContent === text) {
      const i = findIndex();
      const button = joke.children[i];
      button.click();
    }
  });
}

// to create joke's form

function appenderSimple(flag = true) {
  const jokeInfo = JSON.parse(this.responseText);
  if (jokeInfo.total) {
    for (let i = 0; i < jokeInfo.total; i++) {
      appenderToCreate(jokeInfo.result[i], flag);
    }
  } else {
    appenderToCreate(jokeInfo);
  }
}

function appenderToCreate(jokeInfo, flag = true) {
  const body = document.getElementById('buttons');
  const joke = document.createElement('DIV');
  joke.classList.add('joke');
  const hours = Math.floor(
    (Date.now() - Date.parse(jokeInfo.updated_at)) / 3600000
  );
  const date = document.createElement('P');
  const favBtn = createLikeButton();
  const icon = document.createElement('IMG');
  const id = document.createElement('A');
  const text = document.createElement('P');
  text.innerText = jokeInfo.value;
  text.classList.add('text');
  date.innerText = `Last update: ${hours} hours ago`;
  date.classList.add('update');
  icon.classList.add('icon');
  icon.setAttribute('alt', 'nothing');
  icon.setAttribute('src', '../../public/images/chuck-norris.png');
  id.innerText = `ID: ${jokeInfo.id}`;
  id.classList.add('id');
  id.setAttribute('href', `${jokeInfo.url}`);
  [icon, id, favBtn, text, date].forEach(el => joke.appendChild(el));
  if (jokeInfo.categories[0]) {
    const category = document.createElement('P');
    category.innerText = jokeInfo.categories[0];
    category.classList.add('categ');
    joke.appendChild(category);
  }
  if (flag) {
    body.appendChild(joke);
    prevState.push(joke);
    isFavourite(joke);
  } else {
    const i = findIndex();
    const button = joke.children[i];
    button.click();
  }
}

function onGetRan() {
  httpRequest(appenderSimple, 'https://api.chucknorris.io/jokes/random');
}

function onGetCat() {
  for (const value of categoryOnClick.values()) {
    const category = value.toLowerCase();
    httpRequest(
      appenderSimple,
      `https://api.chucknorris.io/jokes/random?category=${category}`
    );
  }
}

function append(flag, onlyOne = false) {
  return function appender() {
    const jokeInfo = JSON.parse(this.responseText);
    if (jokeInfo.total) {
      if (onlyOne) {
        appenderToCreate(jokeInfo.result[0], flag);
        return;
      }
      for (let i = 0; i < jokeInfo.total; i++) {
        appenderToCreate(jokeInfo.result[i], flag);
      }
    } else {
      appenderToCreate(jokeInfo);
    }
  };
}

function onGetSearch(value = '', flag = true) {
  let query = value;
  if (!query) {
    const text = document.getElementById('searchInp');
    if (text.value) query = text.value;
  }
  if (query) {
    let appender;
    if (query.length < 115) {
      appender = append(flag, true);
    } else {
      query = query.slice(0, 115);
      appender = append(flag);
    }
    httpRequest(
      appender,
      `https://api.chucknorris.io/jokes/search?query=${query}`
    );
  }
}

// when button 'Get a joke' is clicked

function onGetClick() {
  for (const el of prevState) {
    el.remove();
  }
  prevState = [];
  for (const el in ident) {
    if (ident[el]) onGet[el]();
  }
}

// to prevent repeating onclick event

function preventer() {
  const getJokes = document.getElementById('get-jokes');
  let flag = true;
  getJokes.addEventListener('click', () => {
    if (flag) {
      onGetClick();
      flag = false;
      setTimeout(() => (flag = true), 500);
    }
  });
}

// to create input field

function onSearchWrap() {
  const before = document.getElementById('get-jokes');
  const toPut = document.getElementById('buttons');
  const input = document.createElement('INPUT');
  input.setAttribute('id', 'searchInp');
  let flag = true;
  input.onkeyup = ev => {
    if (ev.keyCode === 13) {
      if (flag) {
        onGetClick();
        flag = false;
        setTimeout(() => (flag = true), 500);
      }
    }
  };
  const br = document.createElement('BR');
  br.id = 'brToDel';
  input.placeholder = 'Free text search...';
  return () => {
    ident['Sear']
      ? [input, br].map(el => el.remove())
      : [input, br].map(el => toPut.insertBefore(el, before));
  };
}

function findIndex() {
  return 2;
}
