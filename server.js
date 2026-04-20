'use strict';

var http = require('http');
var fs = require('fs');
var path = require('path');
var url = require('url');
var querystring = require('querystring');

var store = require('./lib/store');
var auth = require('./lib/auth');
var render = require('./lib/render');
var helpers = require('./lib/helpers');

var PORT = parseInt(process.env.PORT || '3000', 10);
var PUBLIC_DIR = path.join(__dirname, 'public');

store.ensureStorage();
store.bootstrapSystem();
auth.ensureAdminUser(store);

function ordered(name) {
  return store.list(name).slice().sort(function(a, b) {
    return new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime();
  });
}

function getBaseState() {
  return {
    content: store.get('content'),
    categories: store.list('categories'),
    classes: store.list('classes')
  };
}

function getAdminState() {
  var base = getBaseState();
  base.volunteers = ordered('volunteers');
  base.serviceRequests = ordered('serviceRequests');
  base.partners = ordered('partners');
  base.donations = ordered('donations');
  base.contacts = ordered('contacts');
  base.media = ordered('media');
  base.activity = ordered('activity');
  return base;
}

function flashFromQuery(query) {
  return {
    notice: query.notice || '',
    error: query.error || ''
  };
}

function send(res, statusCode, contentType, body, extraHeaders) {
  var headers = extraHeaders || {};
  headers['Content-Type'] = contentType;
  headers['X-Content-Type-Options'] = 'nosniff';
  headers['Referrer-Policy'] = 'same-origin';
  headers['X-Frame-Options'] = 'SAMEORIGIN';
  res.writeHead(statusCode, headers);
  res.end(body);
}

function sendHtml(res, statusCode, html, extraHeaders) {
  send(res, statusCode, 'text/html; charset=utf-8', html, extraHeaders);
}

function sendText(res, statusCode, text, extraHeaders) {
  send(res, statusCode, 'text/plain; charset=utf-8', text, extraHeaders);
}

function redirect(res, location, cookieHeader) {
  var headers = {
    'Location': location
  };
  if (cookieHeader) {
    headers['Set-Cookie'] = cookieHeader;
  }
  res.writeHead(302, headers);
  res.end();
}

function notFound(res) {
  sendHtml(res, 404, '<h1>404</h1><p>Page not found.</p>');
}

function serveStatic(req, res, pathname) {
  var relativePath = String(pathname || '').replace(/^\/+/, '');
  var safePath = path.normalize(path.join(PUBLIC_DIR, relativePath));
  if (safePath.indexOf(PUBLIC_DIR) !== 0) {
    notFound(res);
    return true;
  }

  if (!fs.existsSync(safePath) || fs.statSync(safePath).isDirectory()) {
    return false;
  }

  send(res, 200, mimeTypeFor(safePath), fs.readFileSync(safePath));
  return true;
}

function mimeTypeFor(filePath) {
  var extension = path.extname(filePath).toLowerCase();
  var map = {
    '.css': 'text/css; charset=utf-8',
    '.js': 'application/javascript; charset=utf-8',
    '.jpg': 'image/jpeg',
    '.jpeg': 'image/jpeg',
    '.png': 'image/png',
    '.gif': 'image/gif',
    '.webp': 'image/webp',
    '.svg': 'image/svg+xml',
    '.pdf': 'application/pdf',
    '.json': 'application/json; charset=utf-8'
  };
  return map[extension] || 'application/octet-stream';
}

function parseBody(req, callback) {
  var chunks = [];
  var length = 0;

  req.on('data', function(chunk) {
    length += chunk.length;
    if (length > 8 * 1024 * 1024) {
      req.destroy();
      return;
    }
    chunks.push(chunk);
  });

  req.on('end', function() {
    var raw = Buffer.concat(chunks).toString('utf8');
    callback(querystring.parse(raw));
  });
}

function clean(value) {
  return String(value || '').trim();
}

function requireFields(body, fields) {
  var i;
  for (i = 0; i < fields.length; i += 1) {
    if (!clean(body[fields[i]])) {
      return fields[i];
    }
  }
  return '';
}

function queueFormNotification(subject, lines) {
  var content = store.get('content');
  store.queueNotification('email', content.notificationEmail, subject, lines.join('\n'), 'queued');
}

function saveFormEntry(collection, payload, activityTitle, activityDetail, subject, lines) {
  store.insert(collection, payload);
  store.logActivity(collection, activityTitle, activityDetail);
  queueFormNotification(subject, lines);
}

function userContextOrRedirect(req, res) {
  var session = auth.currentUser(req, store);
  if (!session) {
    redirect(res, '/admin/login?error=' + encodeURIComponent('Please log in to access the admin panel.'));
    return null;
  }
  return session;
}

function csvResponse(res, filename, content) {
  send(res, 200, 'text/csv; charset=utf-8', content, {
    'Content-Disposition': 'attachment; filename="' + filename + '"'
  });
}

function handlePublicGet(pathname, parsedUrl, req, res) {
  var state = getBaseState();
  var flash = flashFromQuery(parsedUrl.query);

  if (pathname === '/') {
    sendHtml(res, 200, render.renderHomePage(state, flash));
    return true;
  }
  if (pathname === '/about') {
    sendHtml(res, 200, render.renderAboutPage(state, flash));
    return true;
  }
  if (pathname === '/volunteer') {
    sendHtml(res, 200, render.renderVolunteerPage(state, flash));
    return true;
  }
  if (pathname === '/classes') {
    sendHtml(res, 200, render.renderClassesPage(state, flash));
    return true;
  }
  if (pathname === '/services') {
    sendHtml(res, 200, render.renderServicesPage(state, flash));
    return true;
  }
  if (pathname === '/partner') {
    sendHtml(res, 200, render.renderPartnerPage(state, flash));
    return true;
  }
  if (pathname === '/donate') {
    sendHtml(res, 200, render.renderDonationPage(state, flash));
    return true;
  }
  if (pathname === '/contact') {
    sendHtml(res, 200, render.renderContactPage(state, flash));
    return true;
  }

  return false;
}

function handlePublicPost(pathname, req, res) {
  parseBody(req, function(body) {
    var missing;
    if (pathname === '/volunteer') {
      missing = requireFields(body, ['name', 'phone', 'email', 'city', 'age', 'interest', 'availability', 'message']);
      if (missing) {
        redirect(res, '/volunteer?error=' + encodeURIComponent('Please complete all required volunteer fields.'));
        return;
      }

      saveFormEntry('volunteers', {
        id: helpers.uid('volunteer'),
        createdAt: new Date().toISOString(),
        name: clean(body.name),
        phone: clean(body.phone),
        email: clean(body.email),
        city: clean(body.city),
        age: clean(body.age),
        interest: clean(body.interest),
        availability: clean(body.availability),
        message: clean(body.message),
        status: 'New'
      }, 'New volunteer enquiry', clean(body.name), 'New Volunteer Enquiry', [
        'Name: ' + clean(body.name),
        'Phone: ' + clean(body.phone),
        'Email: ' + clean(body.email),
        'Interest: ' + clean(body.interest)
      ]);

      redirect(res, '/volunteer?notice=' + encodeURIComponent('Volunteer form submitted successfully.'));
      return;
    }

    if (pathname === '/services') {
      missing = requireFields(body, ['name', 'businessName', 'phone', 'serviceRequired', 'details']);
      if (missing) {
        redirect(res, '/services?error=' + encodeURIComponent('Please complete all required service request fields.'));
        return;
      }

      saveFormEntry('serviceRequests', {
        id: helpers.uid('service'),
        createdAt: new Date().toISOString(),
        name: clean(body.name),
        businessName: clean(body.businessName),
        phone: clean(body.phone),
        serviceRequired: clean(body.serviceRequired),
        details: clean(body.details),
        status: 'New'
      }, 'New service enquiry', clean(body.businessName), 'New Service Request', [
        'Name: ' + clean(body.name),
        'Business: ' + clean(body.businessName),
        'Phone: ' + clean(body.phone),
        'Service: ' + clean(body.serviceRequired)
      ]);

      redirect(res, '/services?notice=' + encodeURIComponent('Service request submitted successfully.'));
      return;
    }

    if (pathname === '/partner') {
      missing = requireFields(body, ['name', 'organization', 'phone', 'driveType', 'description']);
      if (missing) {
        redirect(res, '/partner?error=' + encodeURIComponent('Please complete all required partnership fields.'));
        return;
      }

      saveFormEntry('partners', {
        id: helpers.uid('partner'),
        createdAt: new Date().toISOString(),
        name: clean(body.name),
        organization: clean(body.organization),
        phone: clean(body.phone),
        driveType: clean(body.driveType),
        description: clean(body.description),
        budget: clean(body.budget),
        status: 'New',
        notes: ''
      }, 'New partnership enquiry', clean(body.organization), 'New Partnership Request', [
        'Name: ' + clean(body.name),
        'Organization: ' + clean(body.organization),
        'Phone: ' + clean(body.phone),
        'Drive Type: ' + clean(body.driveType)
      ]);

      redirect(res, '/partner?notice=' + encodeURIComponent('Partnership request submitted successfully.'));
      return;
    }

    if (pathname === '/donate') {
      missing = requireFields(body, ['name', 'amount', 'phone']);
      if (missing) {
        redirect(res, '/donate?error=' + encodeURIComponent('Please complete name, amount, and phone.'));
        return;
      }

      saveFormEntry('donations', {
        id: helpers.uid('donation'),
        createdAt: new Date().toISOString(),
        name: clean(body.name),
        amount: clean(body.amount),
        phone: clean(body.phone),
        message: clean(body.message),
        paymentStatus: 'Pending'
      }, 'Donation record created', clean(body.name), 'New Donation Record', [
        'Name: ' + clean(body.name),
        'Amount: ' + clean(body.amount),
        'Phone: ' + clean(body.phone)
      ]);

      redirect(res, '/donate?notice=' + encodeURIComponent('Donation details saved successfully.'));
      return;
    }

    if (pathname === '/contact') {
      missing = requireFields(body, ['name', 'phone', 'email', 'message']);
      if (missing) {
        redirect(res, '/contact?error=' + encodeURIComponent('Please complete all required contact fields.'));
        return;
      }

      saveFormEntry('contacts', {
        id: helpers.uid('contact'),
        createdAt: new Date().toISOString(),
        name: clean(body.name),
        phone: clean(body.phone),
        email: clean(body.email),
        message: clean(body.message)
      }, 'New contact enquiry', clean(body.name), 'New Contact Message', [
        'Name: ' + clean(body.name),
        'Phone: ' + clean(body.phone),
        'Email: ' + clean(body.email)
      ]);

      redirect(res, '/contact?notice=' + encodeURIComponent('Message sent successfully.'));
      return;
    }

    notFound(res);
  });
}

function handleAdminGet(pathname, parsedUrl, req, res) {
  var session;
  var state;
  var flash;
  var csv;

  if (pathname === '/admin/login') {
    sendHtml(res, 200, render.renderAdminLogin(flashFromQuery(parsedUrl.query)));
    return true;
  }

  session = userContextOrRedirect(req, res);
  if (!session) {
    return true;
  }

  state = getAdminState();
  flash = flashFromQuery(parsedUrl.query);

  if (pathname === '/admin') {
    sendHtml(res, 200, render.renderAdminDashboard(state, session.user, flash));
    return true;
  }
  if (pathname === '/admin/volunteers') {
    sendHtml(res, 200, render.renderAdminVolunteers(state, session.user, flash, parsedUrl.query));
    return true;
  }
  if (pathname === '/admin/service-requests') {
    sendHtml(res, 200, render.renderAdminServiceRequests(state, session.user, flash, parsedUrl.query));
    return true;
  }
  if (pathname === '/admin/partners') {
    sendHtml(res, 200, render.renderAdminPartners(state, session.user, flash, parsedUrl.query));
    return true;
  }
  if (pathname === '/admin/donations') {
    sendHtml(res, 200, render.renderAdminDonations(state, session.user, flash, parsedUrl.query));
    return true;
  }
  if (pathname === '/admin/contacts') {
    sendHtml(res, 200, render.renderAdminContacts(state, session.user, flash, parsedUrl.query));
    return true;
  }
  if (pathname === '/admin/categories') {
    sendHtml(res, 200, render.renderAdminCategories(state, session.user, flash, parsedUrl.query));
    return true;
  }
  if (pathname === '/admin/classes') {
    sendHtml(res, 200, render.renderAdminClasses(state, session.user, flash, parsedUrl.query));
    return true;
  }
  if (pathname === '/admin/content') {
    sendHtml(res, 200, render.renderAdminContent(state, session.user, flash));
    return true;
  }
  if (pathname === '/admin/media') {
    sendHtml(res, 200, render.renderAdminMedia(state, session.user, flash));
    return true;
  }

  if (pathname === '/admin/export/volunteers.csv') {
    csv = helpers.toCsv(state.volunteers, [
      { key: 'name', label: 'Name' },
      { key: 'phone', label: 'Phone' },
      { key: 'email', label: 'Email' },
      { key: 'city', label: 'City' },
      { key: 'age', label: 'Age' },
      { key: 'interest', label: 'Interest' },
      { key: 'availability', label: 'Availability' },
      { key: 'message', label: 'Message' },
      { key: 'status', label: 'Status' },
      { key: 'createdAt', label: 'Created At' }
    ]);
    csvResponse(res, 'volunteers.csv', csv);
    return true;
  }
  if (pathname === '/admin/export/service-requests.csv') {
    csv = helpers.toCsv(state.serviceRequests, [
      { key: 'name', label: 'Name' },
      { key: 'businessName', label: 'Business Name' },
      { key: 'phone', label: 'Phone' },
      { key: 'serviceRequired', label: 'Service Required' },
      { key: 'details', label: 'Details' },
      { key: 'status', label: 'Status' },
      { key: 'createdAt', label: 'Created At' }
    ]);
    csvResponse(res, 'service-requests.csv', csv);
    return true;
  }
  if (pathname === '/admin/export/partners.csv') {
    csv = helpers.toCsv(state.partners, [
      { key: 'name', label: 'Name' },
      { key: 'organization', label: 'Organization' },
      { key: 'phone', label: 'Phone' },
      { key: 'driveType', label: 'Drive Type' },
      { key: 'description', label: 'Description' },
      { key: 'budget', label: 'Budget' },
      { key: 'status', label: 'Status' },
      { key: 'notes', label: 'Notes' },
      { key: 'createdAt', label: 'Created At' }
    ]);
    csvResponse(res, 'partners.csv', csv);
    return true;
  }
  if (pathname === '/admin/export/donations.csv') {
    csv = helpers.toCsv(state.donations, [
      { key: 'name', label: 'Name' },
      { key: 'phone', label: 'Phone' },
      { key: 'amount', label: 'Amount' },
      { key: 'message', label: 'Message' },
      { key: 'paymentStatus', label: 'Payment Status' },
      { key: 'createdAt', label: 'Created At' }
    ]);
    csvResponse(res, 'donations.csv', csv);
    return true;
  }
  if (pathname === '/admin/export/contacts.csv') {
    csv = helpers.toCsv(state.contacts, [
      { key: 'name', label: 'Name' },
      { key: 'phone', label: 'Phone' },
      { key: 'email', label: 'Email' },
      { key: 'message', label: 'Message' },
      { key: 'createdAt', label: 'Created At' }
    ]);
    csvResponse(res, 'contacts.csv', csv);
    return true;
  }

  return false;
}

function handleAdminPost(pathname, req, res) {
  if (pathname === '/admin/login') {
    parseBody(req, function(body) {
      var user = auth.attemptLogin(store, clean(body.email), clean(body.password));
      var sessionId;
      if (!user) {
        redirect(res, '/admin/login?error=' + encodeURIComponent('Invalid login credentials.'));
        return;
      }
      sessionId = auth.createSession(store, user);
      redirect(res, '/admin?notice=' + encodeURIComponent('Welcome back.'), auth.serializeCookie(auth.COOKIE_NAME, sessionId, 7 * 24 * 60 * 60));
    });
    return;
  }

  if (pathname === '/admin/logout') {
    var current = auth.currentUser(req, store);
    if (current) {
      auth.destroySession(store, current.sessionId);
      store.logActivity('auth', 'Admin signed out', current.user.email);
    }
    redirect(res, '/admin/login?notice=' + encodeURIComponent('Logged out successfully.'), auth.serializeCookie(auth.COOKIE_NAME, '', 0));
    return;
  }

  var session = userContextOrRedirect(req, res);
  if (!session) {
    return;
  }

  parseBody(req, function(body) {
    var id = clean(body.id);
    var updated;
    var content;
    var thumbnailUrl;
    var imageUrl;

    if (pathname === '/admin/volunteers/status') {
      updated = store.update('volunteers', id, function(item) {
        item.status = clean(body.status) || item.status;
        return item;
      });
      if (updated) {
        store.logActivity('volunteers', 'Volunteer status updated', updated.name + ' -> ' + updated.status);
      }
      redirect(res, '/admin/volunteers?notice=' + encodeURIComponent('Volunteer status updated.'));
      return;
    }

    if (pathname === '/admin/service-requests/status') {
      updated = store.update('serviceRequests', id, function(item) {
        item.status = clean(body.status) || item.status;
        return item;
      });
      if (updated) {
        store.logActivity('serviceRequests', 'Service lead updated', updated.businessName + ' -> ' + updated.status);
      }
      redirect(res, '/admin/service-requests?notice=' + encodeURIComponent('Service request updated.'));
      return;
    }

    if (pathname === '/admin/partners/update') {
      updated = store.update('partners', id, function(item) {
        item.status = clean(body.status) || item.status;
        item.notes = clean(body.notes);
        return item;
      });
      if (updated) {
        store.logActivity('partners', 'Partnership review updated', updated.organization + ' -> ' + updated.status);
      }
      redirect(res, '/admin/partners?notice=' + encodeURIComponent('Partnership request updated.'));
      return;
    }

    if (pathname === '/admin/donations/status') {
      updated = store.update('donations', id, function(item) {
        item.paymentStatus = clean(body.paymentStatus) || item.paymentStatus;
        return item;
      });
      if (updated) {
        store.logActivity('donations', 'Donation payment status updated', updated.name + ' -> ' + updated.paymentStatus);
      }
      redirect(res, '/admin/donations?notice=' + encodeURIComponent('Donation payment status updated.'));
      return;
    }

    if (pathname === '/admin/categories/save') {
      if (!clean(body.name) || !clean(body.description)) {
        redirect(res, '/admin/categories?error=' + encodeURIComponent('Category name and description are required.'));
        return;
      }
      if (id) {
        store.update('categories', id, function(item) {
          item.name = clean(body.name);
          item.description = clean(body.description);
          return item;
        });
        store.logActivity('categories', 'Category updated', clean(body.name));
        redirect(res, '/admin/categories?notice=' + encodeURIComponent('Category updated.'));
        return;
      }
      store.insert('categories', {
        id: helpers.uid('category'),
        name: clean(body.name),
        description: clean(body.description)
      });
      store.logActivity('categories', 'Category created', clean(body.name));
      redirect(res, '/admin/categories?notice=' + encodeURIComponent('Category created.'));
      return;
    }

    if (pathname === '/admin/categories/delete') {
      store.remove('categories', id);
      store.logActivity('categories', 'Category deleted', id);
      redirect(res, '/admin/categories?notice=' + encodeURIComponent('Category deleted.'));
      return;
    }

    if (pathname === '/admin/classes/save') {
      if (!clean(body.title) || !clean(body.categoryId) || !clean(body.description)) {
        redirect(res, '/admin/classes?error=' + encodeURIComponent('Title, category, and description are required.'));
        return;
      }

      thumbnailUrl = clean(body.thumbnail);
      if (clean(body.thumbnailData)) {
        thumbnailUrl = store.saveBase64File(clean(body.title), clean(body.thumbnailData));
      }

      if (id) {
        store.update('classes', id, function(item) {
          item.title = clean(body.title);
          item.categoryId = clean(body.categoryId);
          item.thumbnail = thumbnailUrl || item.thumbnail;
          item.videoUrl = clean(body.videoUrl);
          item.description = clean(body.description);
          return item;
        });
        store.logActivity('classes', 'Class updated', clean(body.title));
        redirect(res, '/admin/classes?notice=' + encodeURIComponent('Class updated.'));
        return;
      }

      store.insert('classes', {
        id: helpers.uid('class'),
        title: clean(body.title),
        categoryId: clean(body.categoryId),
        thumbnail: thumbnailUrl || '/assets/aews-logo.jpg',
        videoUrl: clean(body.videoUrl),
        description: clean(body.description)
      });
      store.logActivity('classes', 'Class created', clean(body.title));
      redirect(res, '/admin/classes?notice=' + encodeURIComponent('Class created.'));
      return;
    }

    if (pathname === '/admin/classes/delete') {
      store.remove('classes', id);
      store.logActivity('classes', 'Class deleted', id);
      redirect(res, '/admin/classes?notice=' + encodeURIComponent('Class deleted.'));
      return;
    }

    if (pathname === '/admin/content/save') {
      content = store.get('content');
      content.siteName = clean(body.siteName);
      content.siteShortName = clean(body.siteShortName);
      content.tagline = clean(body.tagline);
      content.heroText = clean(body.heroText);
      content.aboutIntro = clean(body.aboutIntro);
      content.aboutFull = clean(body.aboutFull);
      content.workAreas = helpers.splitLines(body.workAreas);
      content.impactVolunteers = clean(body.impactVolunteers);
      content.impactEvents = clean(body.impactEvents);
      content.impactBeneficiaries = clean(body.impactBeneficiaries);
      content.servicesIntro = clean(body.servicesIntro);
      content.partnershipIntro = clean(body.partnershipIntro);
      content.donationIntro = clean(body.donationIntro);
      content.donationUsage = clean(body.donationUsage);
      content.contactPhone = clean(body.contactPhone);
      content.contactEmail = clean(body.contactEmail);
      content.notificationEmail = clean(body.notificationEmail);
      content.contactAddress = clean(body.contactAddress);
      content.whatsappNumber = clean(body.whatsappNumber);
      content.mapEmbedUrl = clean(body.mapEmbedUrl);
      content.upiId = clean(body.upiId);
      content.upiPayee = clean(body.upiPayee);
      content.paymentGatewayUrl = clean(body.paymentGatewayUrl);
      content.trustText = clean(body.trustText);
      content.certificateTitle = clean(body.certificateTitle);
      content.heroImage = clean(body.heroImage);
      content.aboutImage = clean(body.aboutImage);
      content.servicesImage = clean(body.servicesImage);
      store.set('content', content);
      store.logActivity('content', 'CMS content updated', session.user.email);
      redirect(res, '/admin/content?notice=' + encodeURIComponent('Website content updated.'));
      return;
    }

    if (pathname === '/admin/media/save') {
      if (!clean(body.title) || !clean(body.fileData)) {
        redirect(res, '/admin/media?error=' + encodeURIComponent('Title and image upload are required.'));
        return;
      }
      imageUrl = store.saveBase64File(clean(body.title), clean(body.fileData));
      if (!imageUrl) {
        redirect(res, '/admin/media?error=' + encodeURIComponent('Unable to save uploaded image.'));
        return;
      }
      store.logActivity('media', 'Media uploaded', clean(body.title));
      redirect(res, '/admin/media?notice=' + encodeURIComponent('Media uploaded successfully.'));
      return;
    }

    if (pathname === '/admin/media/delete') {
      updated = store.find('media', id);
      if (updated) {
        store.deleteUploadedFile(updated.url);
      }
      store.remove('media', id);
      store.logActivity('media', 'Media deleted', id);
      redirect(res, '/admin/media?notice=' + encodeURIComponent('Media deleted.'));
      return;
    }

    notFound(res);
  });
}

var server = http.createServer(function(req, res) {
  var parsedUrl = url.parse(req.url, true);
  var pathname = parsedUrl.pathname;

  if (pathname.indexOf('/css/') === 0 || pathname.indexOf('/js/') === 0 || pathname.indexOf('/assets/') === 0 || pathname.indexOf('/uploads/') === 0) {
    if (!serveStatic(req, res, pathname)) {
      notFound(res);
    }
    return;
  }

  if (req.method === 'GET' && handlePublicGet(pathname, parsedUrl, req, res)) {
    return;
  }

  if (req.method === 'POST' && (pathname === '/volunteer' || pathname === '/services' || pathname === '/partner' || pathname === '/donate' || pathname === '/contact')) {
    handlePublicPost(pathname, req, res);
    return;
  }

  if (pathname.indexOf('/admin') === 0) {
    if (req.method === 'GET' && handleAdminGet(pathname, parsedUrl, req, res)) {
      return;
    }
    if (req.method === 'POST') {
      handleAdminPost(pathname, req, res);
      return;
    }
  }

  notFound(res);
});

server.listen(PORT, function() {
  console.log('AEWS platform running at http://localhost:' + PORT);
  console.log('Admin login: ' + auth.DEFAULT_ADMIN_EMAIL + ' / ' + auth.DEFAULT_ADMIN_PASSWORD);
});
