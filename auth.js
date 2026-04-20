'use strict';

var crypto = require('crypto');
var helpers = require('./helpers');

var COOKIE_NAME = 'aews_session';
var DEFAULT_ADMIN_EMAIL = 'admin@aews.org';
var DEFAULT_ADMIN_PASSWORD = 'ChangeMe123!';

function hashPassword(password, salt) {
  return crypto.pbkdf2Sync(password, salt, 12000, 64, 'sha512').toString('hex');
}

function ensureAdminUser(store) {
  var users = store.list('users');
  var salt;
  if (users.length) {
    return;
  }

  salt = crypto.randomBytes(16).toString('hex');
  store.insert('users', {
    id: helpers.uid('user'),
    name: 'AEWS Admin',
    email: DEFAULT_ADMIN_EMAIL,
    role: 'admin',
    passwordSalt: salt,
    passwordHash: hashPassword(DEFAULT_ADMIN_PASSWORD, salt),
    createdAt: new Date().toISOString()
  });
  store.logActivity('system', 'Default admin account created', DEFAULT_ADMIN_EMAIL);
}

function parseCookies(cookieHeader) {
  var cookies = {};
  String(cookieHeader || '').split(';').forEach(function(pair) {
    var index = pair.indexOf('=');
    if (index === -1) {
      return;
    }
    var key = pair.slice(0, index).trim();
    var value = pair.slice(index + 1).trim();
    cookies[key] = decodeURIComponent(value);
  });
  return cookies;
}

function serializeCookie(name, value, maxAgeSeconds) {
  var parts = [
    name + '=' + encodeURIComponent(value || ''),
    'Path=/',
    'HttpOnly',
    'SameSite=Strict'
  ];

  if (maxAgeSeconds !== undefined) {
    parts.push('Max-Age=' + maxAgeSeconds);
  }

  return parts.join('; ');
}

function createSession(store, user) {
  var sessionId = crypto.randomBytes(24).toString('hex');
  var expiresAt = new Date(Date.now() + (7 * 24 * 60 * 60 * 1000)).toISOString();
  store.insert('sessions', {
    id: sessionId,
    userId: user.id,
    expiresAt: expiresAt,
    createdAt: new Date().toISOString()
  });
  store.logActivity('auth', 'Admin signed in', user.email);
  return sessionId;
}

function destroySession(store, sessionId) {
  if (!sessionId) {
    return;
  }
  store.remove('sessions', sessionId);
}

function currentUser(req, store) {
  var cookies = parseCookies(req.headers.cookie);
  var sessionId = cookies[COOKIE_NAME];
  var session;
  var user;

  if (!sessionId) {
    return null;
  }

  session = store.find('sessions', sessionId);
  if (!session) {
    return null;
  }

  if (new Date(session.expiresAt).getTime() < Date.now()) {
    destroySession(store, sessionId);
    return null;
  }

  user = store.find('users', session.userId);
  if (!user) {
    destroySession(store, sessionId);
    return null;
  }

  return {
    sessionId: sessionId,
    user: user
  };
}

function attemptLogin(store, email, password) {
  var users = store.list('users');
  var i;
  var user;
  for (i = 0; i < users.length; i += 1) {
    user = users[i];
    if (String(user.email).toLowerCase() !== String(email || '').toLowerCase()) {
      continue;
    }

    if (hashPassword(String(password || ''), user.passwordSalt) === user.passwordHash) {
      return user;
    }
  }
  return null;
}

module.exports = {
  COOKIE_NAME: COOKIE_NAME,
  DEFAULT_ADMIN_EMAIL: DEFAULT_ADMIN_EMAIL,
  DEFAULT_ADMIN_PASSWORD: DEFAULT_ADMIN_PASSWORD,
  ensureAdminUser: ensureAdminUser,
  parseCookies: parseCookies,
  serializeCookie: serializeCookie,
  createSession: createSession,
  destroySession: destroySession,
  currentUser: currentUser,
  attemptLogin: attemptLogin
};
