'use strict';

const { crypto, common } = require('./dependencies.js');
const application = require('./application.js');

const BYTE = 256;
const LINK_LENGTH = 120;
const TOKEN = 'token';
const TOKEN_LENGTH = 32;
const ALPHA_UPPER = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
const ALPHA_LOWER = 'abcdefghijklmnopqrstuvwxyz';
const ALPHA = ALPHA_UPPER + ALPHA_LOWER;
const DIGIT = '0123456789';
const ALPHA_DIGIT = ALPHA + DIGIT;
const EPOCH = 'Thu, 01 Jan 1970 00:00:00 GMT';
const FUTURE = 'Fri, 01 Jan 2100 00:00:00 GMT';
const LOCATION = 'Path=/; Domain';
const COOKIE_DELETE = `${TOKEN}=deleted; Expires=${EPOCH}; ${LOCATION}=`;
const COOKIE_HOST = `Expires=${FUTURE}; ${LOCATION}`;

const sessions = new Map();
const cache = new WeakMap();

const generateToken = () => {
  const base = ALPHA_DIGIT.length;
  const bytes = crypto.randomBytes(base);
  let key = '';
  for (let i = 0; i < TOKEN_LENGTH; i++) {
    const index = ((bytes[i] * base) / BYTE) | 0;
    key += ALPHA_DIGIT[index];
  }
  return key;
};

const parseCookies = cookie => {
  const values = {};
  const items = cookie.split(';');
  for (const item of items) {
    const parts = item.split('=');
    const key = parts[0].trim();
    const val = parts[1] || '';
    values[key] = val.trim();
  }
  return values;
};

module.exports = () => {
  const { db } = application;

  const save = (token, context) => {
    const data = JSON.stringify(context);
    db.update('Session', { data }, { token });
  };

  class Session {
    constructor(token, contextData = { token }) {
      const contextHandler = {
        get: (data, key) => {
          if (key === 'token') return this.token;
          return Reflect.get(data, key);
        },
        set: (data, key, value) => {
          const res = Reflect.set(data, key, value);
          save(token, this.data);
          return res;
        },
      };
      this.token = token;
      this.data = contextData;
      this.context = new Proxy(contextData, contextHandler);
    }
  }

  const start = (client, userId) => {
    const token = generateToken();
    const host = common.parseHost(client.req.headers.host);
    const ip = client.req.connection.remoteAddress;
    const cookie = `${TOKEN}=${token}; ${COOKIE_HOST}=${host}; HttpOnly`;
    const session = new Session(token);
    sessions.set(token, session);
    cache.set(client.req, session);
    const data = JSON.stringify(session.data);
    db.insert('Session', { userId, token, ip, data });
    if (client.res) client.res.setHeader('Set-Cookie', cookie);
    return session;
  };

  const restore = async client => {
    const cachedSession = cache.get(client.req);
    if (cachedSession) return cachedSession;
    const { cookie } = client.req.headers;
    if (!cookie) return null;
    const cookies = parseCookies(cookie);
    const { token } = cookies;
    if (!token) return null;
    let session = sessions.get(token);
    if (!session) {
      const [record] = await db.select('Session', ['Data'], { token });
      if (record && record.data) {
        const data = JSON.parse(record.data);
        session = new Session(token, data);
        sessions.set(token, session);
      }
    }
    if (!session) return null;
    cache.set(client.req, session);
    return session;
  };

  const remove = (client, token) => {
    const host = common.parseHost(client.req.headers.host);
    client.res.setHeader('Set-Cookie', COOKIE_DELETE + host);
    sessions.delete(token);
    db.delete('Session', { token });
  };

  const registerUser = async (login, password, fullName, email) => {
    const [userWithTheSameLogin] = await db.select('SystemUser', ['Login'], {
      login,
    });
    if (userWithTheSameLogin) return { field: 'login' };
    const [userWithTheSameEmail] = await db.select('SystemUser', ['Email'], {
      email,
    });
    if (userWithTheSameEmail) return { field: 'email' };
    db.insert('SystemUser', { login, password, fullName, email });
  };

  const getUser = async login => {
    const res = await db.select('SystemUser', ['Id', 'Password'], { login });
    return res[0];
  };

  const getUserByToken = async token => {
    const [session] = await db.select('Session', ['UserId'], { token });
    const { userid: id } = session;
    const [user] = await db.select('SystemUser', ['Password'], { id });
    return user;
  };

  const getUserByEmail = async email => {
    const [user] = await db.select('SystemUser', ['Id', 'Email'], { email });
    return user;
  };

  const changePassword = async ({ token, password }) => {
    const [session] = await db.select('Session', ['UserId'], { token });
    const { userid: id } = session;
    db.update('SystemUser', { password }, { id });
  };

  const getUserInfo = async token => {
    const [session] = await db.select('Session', ['UserId'], { token });
    if (!session) return;
    const { userid: id } = session;
    const [info] = await db.select('SystemUser', ['FullName'], { id });
    return info;
  };

  const insertLink = async (UserId, Link) => {
    const [url] = await db.select('passwordResetUrl', ['Id'], { UserId });
    if (url) db.delete('passwordResetUrl', { UserId });
    db.insert('passwordResetUrl', { UserId, Link });
  };

  const linkExist = async Link => {
    const [exist] = await db.select('passwordResetUrl', ['Id', 'TimeStamp'], {
      Link,
    });
    if (exist) {
      const hour = (new Date() - new Date(exist.timestamp)) / 3600000 - 3;
      if (hour < 1) return true;
    }
    return false;
  };

  const changePasswordByLink = async ({ hash, href }) => {
    const sure = await linkExist(href);
    if (sure) {
      const [user] = await db.select('passwordResetUrl', ['UserId'], {
        Link: href,
      });
      if (!user) return false;
      db.update('SystemUser', { password: hash }, { id: user.userid });
      return true;
    }
    return false;
  };

  const generateLink = () => {
    const base = ALPHA_DIGIT.length * 3;
    const bytes = crypto.randomBytes(base);
    let key = '';
    for (let i = 0; i < LINK_LENGTH; i++) {
      const index = ((bytes[i] * base) / (BYTE * 3)) | 0;
      key += ALPHA_DIGIT[index];
    }
    return key;
  };

  const insertJoke = async token => {
    const [session] = await db.select('Session', ['UserId'], { token });
    if (!session) return;
    const { userid } = session;
    db.delete('Jokes', { userid });
    return async joke => {
      db.insert('Jokes', { userid, joke });
    };
  };

  const getJokes = async token => {
    const [session] = await db.select('Session', ['UserId'], { token });
    if (!session) return;
    const { userid } = session;
    const jokes = await db.select('Jokes', ['Joke'], { userid });
    if (jokes) return jokes;
  };

  return Object.freeze({
    start,
    restore,
    remove,
    save,
    registerUser,
    getUser,
    getUserInfo,
    getUserByToken,
    changePassword,
    getUserByEmail,
    generateLink,
    insertLink,
    linkExist,
    changePasswordByLink,
    insertJoke,
    getJokes,
  });
};
