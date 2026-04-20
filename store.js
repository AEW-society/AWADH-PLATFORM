'use strict';

var fs = require('fs');
var path = require('path');
var helpers = require('./helpers');

var DATA_DIR = path.join(__dirname, '..', 'data');
var PUBLIC_DIR = path.join(__dirname, '..', 'public');
var UPLOADS_DIR = path.join(PUBLIC_DIR, 'uploads');

var FILES = {
  content: 'content.json',
  categories: 'categories.json',
  classes: 'classes.json',
  volunteers: 'volunteers.json',
  serviceRequests: 'serviceRequests.json',
  partners: 'partners.json',
  donations: 'donations.json',
  contacts: 'contacts.json',
  media: 'media.json',
  users: 'users.json',
  sessions: 'sessions.json',
  activity: 'activity.json',
  notifications: 'notifications.json',
  system: 'system.json'
};

function ensureDir(dirPath) {
  if (fs.existsSync(dirPath)) {
    return;
  }

  ensureDir(path.dirname(dirPath));
  fs.mkdirSync(dirPath);
}

function filePath(name) {
  return path.join(DATA_DIR, FILES[name]);
}

function ensureStorage() {
  ensureDir(DATA_DIR);
  ensureDir(PUBLIC_DIR);
  ensureDir(UPLOADS_DIR);
}

function read(name) {
  return JSON.parse(fs.readFileSync(filePath(name), 'utf8'));
}

function write(name, value) {
  fs.writeFileSync(filePath(name), JSON.stringify(value, null, 2), 'utf8');
}

function list(name) {
  return read(name);
}

function get(name) {
  return read(name);
}

function set(name, value) {
  write(name, value);
  return value;
}

function insert(name, record) {
  var items = list(name);
  items.push(record);
  write(name, items);
  return record;
}

function update(name, id, updater) {
  var items = list(name);
  var found = null;
  var nextItems = items.map(function(item) {
    if (String(item.id) !== String(id)) {
      return item;
    }

    found = updater(item);
    return found;
  });

  if (found) {
    write(name, nextItems);
  }

  return found;
}

function remove(name, id) {
  var items = list(name);
  var nextItems = items.filter(function(item) {
    return String(item.id) !== String(id);
  });

  write(name, nextItems);
}

function find(name, id) {
  var items = list(name);
  var i;
  for (i = 0; i < items.length; i += 1) {
    if (String(items[i].id) === String(id)) {
      return items[i];
    }
  }
  return null;
}

function logActivity(type, title, detail) {
  var activity = list('activity');
  activity.unshift({
    id: helpers.uid('activity'),
    type: type,
    title: title,
    detail: detail || '',
    createdAt: new Date().toISOString()
  });
  activity = activity.slice(0, 80);
  write('activity', activity);
}

function queueNotification(channel, recipient, subject, body, status) {
  insert('notifications', {
    id: helpers.uid('notification'),
    channel: channel,
    recipient: recipient,
    subject: subject,
    body: body,
    status: status || 'queued',
    createdAt: new Date().toISOString()
  });
}

function saveBase64File(title, dataUrl) {
  var parsed = helpers.parseDataUrl(dataUrl);
  var extension;
  var safeName;
  var filename;
  var outputPath;
  var mediaEntry;

  if (!parsed) {
    return '';
  }

  extension = helpers.fileExtensionFromMime(parsed.mimeType);
  safeName = helpers.slugify(title || 'upload');
  filename = safeName + '-' + Date.now() + extension;
  outputPath = path.join(UPLOADS_DIR, filename);

  fs.writeFileSync(outputPath, parsed.buffer);

  mediaEntry = {
    id: helpers.uid('media'),
    title: title || safeName,
    filename: filename,
    url: '/uploads/' + filename,
    createdAt: new Date().toISOString()
  };

  insert('media', mediaEntry);
  return mediaEntry.url;
}

function deleteUploadedFile(fileUrl) {
  var filename;
  var targetPath;
  if (!fileUrl || fileUrl.indexOf('/uploads/') !== 0) {
    return;
  }

  filename = fileUrl.replace('/uploads/', '');
  targetPath = path.join(UPLOADS_DIR, filename);
  if (fs.existsSync(targetPath)) {
    fs.unlinkSync(targetPath);
  }
}

function bootstrapSystem() {
  var system = get('system');
  if (!system.sessionSecret) {
    system.sessionSecret = helpers.uid('secret') + helpers.uid('secret');
  }
  system.lastBootAt = new Date().toISOString();
  set('system', system);
}

module.exports = {
  ensureStorage: ensureStorage,
  list: list,
  get: get,
  set: set,
  insert: insert,
  update: update,
  remove: remove,
  find: find,
  logActivity: logActivity,
  queueNotification: queueNotification,
  saveBase64File: saveBase64File,
  deleteUploadedFile: deleteUploadedFile,
  bootstrapSystem: bootstrapSystem
};
