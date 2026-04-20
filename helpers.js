'use strict';

var crypto = require('crypto');

function uid(prefix) {
  return (prefix || 'id') + '-' + Date.now() + '-' + crypto.randomBytes(4).toString('hex');
}

function escapeHtml(value) {
  return String(value === undefined || value === null ? '' : value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function slugify(value) {
  return String(value || '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '') || 'item';
}

function formatDate(value) {
  if (!value) {
    return '-';
  }

  var date = new Date(value);
  if (isNaN(date.getTime())) {
    return escapeHtml(value);
  }

  return date.toLocaleDateString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric'
  });
}

function formatDateTime(value) {
  if (!value) {
    return '-';
  }

  var date = new Date(value);
  if (isNaN(date.getTime())) {
    return escapeHtml(value);
  }

  return date.toLocaleString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
}

function splitLines(value) {
  return String(value || '')
    .split(/\r?\n/)
    .map(function(item) {
      return item.trim();
    })
    .filter(function(item) {
      return item.length > 0;
    });
}

function buildQuery(params) {
  var keys = Object.keys(params || {});
  if (!keys.length) {
    return '';
  }

  var pairs = [];
  keys.forEach(function(key) {
    if (params[key] !== undefined && params[key] !== null && String(params[key]).length) {
      pairs.push(encodeURIComponent(key) + '=' + encodeURIComponent(String(params[key])));
    }
  });

  return pairs.length ? ('?' + pairs.join('&')) : '';
}

function youtubeEmbedUrl(value) {
  var input = String(value || '').trim();
  if (!input) {
    return '';
  }

  if (input.indexOf('youtube.com/embed/') !== -1) {
    return input;
  }

  var match = input.match(/[?&]v=([^&]+)/);
  if (match && match[1]) {
    return 'https://www.youtube.com/embed/' + match[1];
  }

  var shortMatch = input.match(/youtu\.be\/([^?&]+)/);
  if (shortMatch && shortMatch[1]) {
    return 'https://www.youtube.com/embed/' + shortMatch[1];
  }

  return input;
}

function toCsv(rows, columns) {
  var header = columns.map(function(column) {
    return csvCell(column.label);
  }).join(',');

  var body = rows.map(function(row) {
    return columns.map(function(column) {
      return csvCell(row[column.key]);
    }).join(',');
  }).join('\n');

  return header + '\n' + body;
}

function csvCell(value) {
  var text = String(value === undefined || value === null ? '' : value).replace(/"/g, '""');
  return '"' + text + '"';
}

function parseDataUrl(dataUrl) {
  var match = String(dataUrl || '').match(/^data:([^;]+);base64,(.+)$/);
  if (!match) {
    return null;
  }

  return {
    mimeType: match[1],
    buffer: new Buffer(match[2], 'base64')
  };
}

function fileExtensionFromMime(mimeType) {
  var map = {
    'image/jpeg': '.jpg',
    'image/jpg': '.jpg',
    'image/png': '.png',
    'image/webp': '.webp',
    'image/gif': '.gif',
    'image/svg+xml': '.svg',
    'application/pdf': '.pdf'
  };

  return map[mimeType] || '';
}

module.exports = {
  uid: uid,
  escapeHtml: escapeHtml,
  slugify: slugify,
  formatDate: formatDate,
  formatDateTime: formatDateTime,
  splitLines: splitLines,
  buildQuery: buildQuery,
  youtubeEmbedUrl: youtubeEmbedUrl,
  toCsv: toCsv,
  parseDataUrl: parseDataUrl,
  fileExtensionFromMime: fileExtensionFromMime
};
