'use strict';

var helpers = require('./helpers');

var VOLUNTEER_BENEFITS = [
  'Contribute to education and social impact programs that matter locally.',
  'Build real-world leadership, coordination, and communication experience.',
  'Collaborate with an organized NGO team on events, classes, and drives.',
  'Grow your network through service, partnerships, and field exposure.'
];

var VOLUNTEER_ROLES = [
  'Teaching and mentoring support',
  'Event coordination and registration',
  'Field outreach and mobilization',
  'Social media and campaign support',
  'Operational assistance and documentation'
];

var SERVICE_CARDS = [
  {
    title: 'Event Management',
    description: 'Volunteer-supported event planning, field coordination, and on-ground execution for community and institutional programs.'
  },
  {
    title: 'Customer Support / Calling',
    description: 'Structured calling support, participant engagement, lead follow-ups, and people-first communication workflows.'
  },
  {
    title: 'Backend Services',
    description: 'Reliable backend support including Tally workflows, data entry, documentation, and administrative operations.'
  }
];

var DRIVE_TYPES = [
  'Educational Drive',
  'Food Distribution',
  'Marathon',
  'Blood Donation Camp',
  'Other'
];

function renderPublicLayout(pageTitle, pathName, body, content, flash) {
  var title = helpers.escapeHtml(pageTitle + ' | ' + content.siteShortName);
  var heroImageStyle = content.heroImage ? ('style="background-image:url(\'' + helpers.escapeHtml(content.heroImage) + '\')"' ) : '';
  return '<!DOCTYPE html>' +
    '<html lang="en">' +
    '<head>' +
      '<meta charset="utf-8">' +
      '<meta name="viewport" content="width=device-width, initial-scale=1">' +
      '<title>' + title + '</title>' +
      '<meta name="description" content="' + helpers.escapeHtml(content.aboutIntro) + '">' +
      '<link rel="stylesheet" href="/css/site.css">' +
    '</head>' +
    '<body>' +
      '<div class="site-shell">' +
        '<header class="site-header">' +
          '<div class="container nav-wrap">' +
            '<a class="brand" href="/">' +
              '<img src="/assets/aews-logo.jpg" alt="AEWS logo">' +
              '<div>' +
                '<strong>' + helpers.escapeHtml(content.siteShortName) + '</strong>' +
                '<span>' + helpers.escapeHtml(content.siteName) + '</span>' +
              '</div>' +
            '</a>' +
            '<button class="nav-toggle" type="button" data-nav-toggle aria-label="Toggle navigation">Menu</button>' +
            '<nav class="site-nav" data-nav>' +
              navLinks(pathName) +
              '<a class="nav-cta" href="/donate">Donate</a>' +
            '</nav>' +
          '</div>' +
        '</header>' +
        flashMarkup(flash) +
        '<main>' + body + '</main>' +
        '<section class="cta-band ' + (content.heroImage ? 'has-image' : '') + '" ' + heroImageStyle + '>' +
          '<div class="container cta-band-inner">' +
            '<div>' +
              '<p class="eyebrow">Ready To Build Impact Together?</p>' +
              '<h2>Volunteers, partners, donors, and community leaders are all welcome.</h2>' +
            '</div>' +
            '<div class="cta-band-actions">' +
              '<a class="btn btn-primary" href="/volunteer">Join as Volunteer</a>' +
              '<a class="btn btn-secondary" href="/partner">Partner / Suggest Drive</a>' +
            '</div>' +
          '</div>' +
        '</section>' +
        '<footer class="site-footer">' +
          '<div class="container footer-grid">' +
            '<div>' +
              '<h3>' + helpers.escapeHtml(content.siteName) + '</h3>' +
              '<p>' + helpers.escapeHtml(content.aboutIntro) + '</p>' +
            '</div>' +
            '<div>' +
              '<h4>Contact</h4>' +
              '<p>' + helpers.escapeHtml(content.contactPhone) + '</p>' +
              '<p>' + helpers.escapeHtml(content.contactEmail) + '</p>' +
              '<p>' + helpers.escapeHtml(content.contactAddress) + '</p>' +
            '</div>' +
            '<div>' +
              '<h4>Quick Links</h4>' +
              '<p><a href="/classes">Classes</a></p>' +
              '<p><a href="/services">Services</a></p>' +
              '<p><a href="/contact">Contact</a></p>' +
              '<p><a href="/admin/login">Admin</a></p>' +
            '</div>' +
          '</div>' +
        '</footer>' +
        whatsappButton(content.whatsappNumber) +
      '</div>' +
      '<script src="/js/site.js"></script>' +
    '</body>' +
    '</html>';
}

function renderAdminLayout(pageTitle, currentSection, body, user, flash) {
  return '<!DOCTYPE html>' +
    '<html lang="en">' +
    '<head>' +
      '<meta charset="utf-8">' +
      '<meta name="viewport" content="width=device-width, initial-scale=1">' +
      '<title>' + helpers.escapeHtml(pageTitle + ' | AEWS Admin') + '</title>' +
      '<link rel="stylesheet" href="/css/site.css">' +
    '</head>' +
    '<body class="admin-body">' +
      '<div class="admin-shell">' +
        '<aside class="admin-sidebar">' +
          '<a class="brand admin-brand" href="/admin">' +
            '<img src="/assets/aews-logo.jpg" alt="AEWS logo">' +
            '<div>' +
              '<strong>AEWS Admin</strong>' +
              '<span>CMS + CRM Dashboard</span>' +
            '</div>' +
          '</a>' +
          '<nav class="admin-nav">' +
            adminNavLink('/admin', 'dashboard', currentSection, 'Dashboard') +
            adminNavLink('/admin/volunteers', 'volunteers', currentSection, 'Volunteers') +
            adminNavLink('/admin/service-requests', 'service-requests', currentSection, 'Service Leads') +
            adminNavLink('/admin/partners', 'partners', currentSection, 'Partnerships') +
            adminNavLink('/admin/donations', 'donations', currentSection, 'Donations') +
            adminNavLink('/admin/contacts', 'contacts', currentSection, 'Contacts') +
            adminNavLink('/admin/categories', 'categories', currentSection, 'Categories') +
            adminNavLink('/admin/classes', 'classes', currentSection, 'Classes') +
            adminNavLink('/admin/content', 'content', currentSection, 'CMS') +
            adminNavLink('/admin/media', 'media', currentSection, 'Media Library') +
          '</nav>' +
        '</aside>' +
        '<div class="admin-main">' +
          '<header class="admin-topbar">' +
            '<div>' +
              '<p class="eyebrow">Secure Admin Panel</p>' +
              '<h1>' + helpers.escapeHtml(pageTitle) + '</h1>' +
            '</div>' +
            '<div class="admin-user">' +
              '<span>' + helpers.escapeHtml(user.name) + ' (' + helpers.escapeHtml(user.role) + ')</span>' +
              '<form method="post" action="/admin/logout">' +
                '<button class="btn btn-secondary btn-small" type="submit">Logout</button>' +
              '</form>' +
            '</div>' +
          '</header>' +
          flashMarkup(flash) +
          '<div class="admin-content">' + body + '</div>' +
        '</div>' +
      '</div>' +
      '<script src="/js/site.js"></script>' +
    '</body>' +
    '</html>';
}

function renderHomePage(state, flash) {
  var content = state.content;
  var classesPreview = state.classes.slice(0, 3).map(function(item) {
    return '<article class="mini-card">' +
      '<span class="tag">' + helpers.escapeHtml(findCategoryName(state.categories, item.categoryId)) + '</span>' +
      '<h3>' + helpers.escapeHtml(item.title) + '</h3>' +
      '<p>' + helpers.escapeHtml(item.description) + '</p>' +
    '</article>';
  }).join('');

  return renderPublicLayout('Home', '/', '' +
    '<section class="hero">' +
      '<div class="container hero-grid">' +
        '<div class="hero-copy">' +
          '<p class="eyebrow">Awadh Educational Welfare Society</p>' +
          '<h1>' + helpers.escapeHtml(content.tagline) + '</h1>' +
          '<p class="hero-text">' + helpers.escapeHtml(content.heroText) + '</p>' +
          '<div class="hero-actions">' +
            '<a class="btn btn-primary" href="/volunteer">Join as Volunteer</a>' +
            '<a class="btn btn-secondary" href="/classes">Explore Classes</a>' +
            '<a class="btn btn-secondary" href="/services">Avail Services</a>' +
            '<a class="btn btn-secondary" href="/partner">Partner / Suggest Drive</a>' +
            '<a class="btn btn-accent" href="/donate">Donate Now</a>' +
          '</div>' +
        '</div>' +
        '<div class="hero-visual">' +
          '<div class="hero-card glass-card">' +
            '<img src="/assets/aews-logo.jpg" alt="AEWS Logo">' +
            '<div>' +
              '<p class="eyebrow">Trusted Community Platform</p>' +
              '<h2>' + helpers.escapeHtml(content.trustText) + '</h2>' +
              '<p>Education, training, events, and partnership-led impact designed for scale.</p>' +
            '</div>' +
          '</div>' +
          '<div class="hero-stat-grid">' +
            statTile(content.impactVolunteers, 'Active volunteers engaged') +
            statTile(content.impactEvents, 'Events and drives completed') +
            statTile(content.impactBeneficiaries, 'Beneficiaries reached') +
          '</div>' +
        '</div>' +
      '</div>' +
    '</section>' +
    '<section class="section">' +
      '<div class="container two-col">' +
        '<div>' +
          '<p class="eyebrow">About AEWS</p>' +
          '<h2>Community-led growth with professional execution</h2>' +
          '<p>' + helpers.escapeHtml(content.aboutIntro) + '</p>' +
          '<a class="text-link" href="/about">Read full about page</a>' +
        '</div>' +
        '<div class="card soft-card">' +
          listItems(content.workAreas) +
        '</div>' +
      '</div>' +
    '</section>' +
    '<section class="section alt-section">' +
      '<div class="container">' +
        '<div class="section-head">' +
          '<div>' +
            '<p class="eyebrow">Our Work</p>' +
            '<h2>Programs that move people from awareness to opportunity</h2>' +
          '</div>' +
        '</div>' +
        '<div class="feature-grid">' +
          featureCard('Education', 'Learning support, guidance, and structured exposure to practical knowledge.') +
          featureCard('Skill Development', 'Job-relevant training modules that build confidence, discipline, and readiness.') +
          featureCard('Events & Drives', 'Community engagement through educational drives, awareness campaigns, and public initiatives.') +
          featureCard('Placement Support', 'Supportive pathways into employability, communication readiness, and career opportunities.') +
        '</div>' +
      '</div>' +
    '</section>' +
    '<section class="section">' +
      '<div class="container certificate-grid">' +
        '<div>' +
          '<p class="eyebrow">Trust & Registration</p>' +
          '<h2>' + helpers.escapeHtml(content.certificateTitle) + '</h2>' +
          '<p>' + helpers.escapeHtml(content.trustText) + '</p>' +
          '<div class="logo-badge">' +
            '<img src="/assets/aews-logo.jpg" alt="AEWS logo">' +
            '<span>Verified identity and registered presence for public confidence.</span>' +
          '</div>' +
          '<a class="btn btn-secondary" href="/assets/AEWS-Registration-Certificate.pdf" target="_blank" rel="noopener">Click to View Full Certificate (PDF)</a>' +
        '</div>' +
        '<div class="certificate-frame">' +
          '<object data="/assets/AEWS-Registration-Certificate.pdf#toolbar=0" type="application/pdf">' +
            '<p>PDF preview unavailable in this browser. <a href="/assets/AEWS-Registration-Certificate.pdf" target="_blank" rel="noopener">Open the certificate</a>.</p>' +
          '</object>' +
        '</div>' +
      '</div>' +
    '</section>' +
    '<section class="section alt-section">' +
      '<div class="container">' +
        '<div class="section-head">' +
          '<div>' +
            '<p class="eyebrow">Quick Actions</p>' +
            '<h2>Choose the path that fits how you want to contribute</h2>' +
          '</div>' +
        '</div>' +
        '<div class="action-grid">' +
          actionCard('/volunteer', 'Become Volunteer', 'Join field work, teaching support, and campaign coordination.') +
          actionCard('/classes', 'Join Classes', 'Browse skill-building classes and start learning immediately.') +
          actionCard('/services', 'Avail Services', 'Request business and community support services from AEWS.') +
          actionCard('/partner', 'Suggest Drive / Partner', 'Propose a drive, campaign, or collaboration opportunity.') +
          actionCard('/donate', 'Donate', 'Support programs that create real educational and social impact.') +
        '</div>' +
      '</div>' +
    '</section>' +
    '<section class="section">' +
      '<div class="container impact-grid">' +
        '<div class="section-head compact">' +
          '<div>' +
            '<p class="eyebrow">Impact Counter</p>' +
            '<h2>Visible momentum backed by community action</h2>' +
          '</div>' +
        '</div>' +
        '<div class="stats-grid">' +
          statCard(content.impactVolunteers, 'Volunteers', 'People powering education, outreach, and delivery.') +
          statCard(content.impactEvents, 'Events', 'Drives, campaigns, and community activations delivered.') +
          statCard(content.impactBeneficiaries, 'Beneficiaries', 'Individuals and families reached through programs.') +
        '</div>' +
      '</div>' +
    '</section>' +
    '<section class="section alt-section">' +
      '<div class="container">' +
        '<div class="section-head">' +
          '<div>' +
            '<p class="eyebrow">Classes Snapshot</p>' +
            '<h2>Practical classes designed for opportunity</h2>' +
          '</div>' +
          '<a class="text-link" href="/classes">View all classes</a>' +
        '</div>' +
        '<div class="mini-grid">' + classesPreview + '</div>' +
      '</div>' +
    '</section>', content, flash);
}

function renderAboutPage(state, flash) {
  var content = state.content;
  return renderPublicLayout('About Us', '/about', '' +
    '<section class="page-hero">' +
      '<div class="container">' +
        '<p class="eyebrow">About Us</p>' +
        '<h1>Building people-first systems for education, opportunity, and welfare</h1>' +
        '<p>' + helpers.escapeHtml(content.aboutIntro) + '</p>' +
      '</div>' +
    '</section>' +
    '<section class="section">' +
      '<div class="container two-col">' +
        '<div class="card soft-card">' +
          '<h2>Our Story</h2>' +
          '<p>' + helpers.escapeHtml(content.aboutFull) + '</p>' +
        '</div>' +
        (content.aboutImage ? '<div class="card image-card"><img src="' + helpers.escapeHtml(content.aboutImage) + '" alt="About AEWS"></div>' : '<div class="stack-grid">' +
          '<article class="mini-card"><h3>Education</h3><p>Access, guidance, and learning journeys that support personal growth.</p></article>' +
          '<article class="mini-card"><h3>Employability</h3><p>Skill-building and confidence-building experiences tied to opportunity.</p></article>' +
          '<article class="mini-card"><h3>Execution</h3><p>Disciplined program delivery for drives, events, and partner-led campaigns.</p></article>' +
        '</div>') +
      '</div>' +
    '</section>' +
    '<section class="section alt-section">' +
      '<div class="container">' +
        '<p class="eyebrow">What We Focus On</p>' +
        '<div class="feature-grid">' + listFeatureCards(content.workAreas) + '</div>' +
      '</div>' +
    '</section>', content, flash);
}

function renderVolunteerPage(state, flash) {
  var content = state.content;
  return renderPublicLayout('Volunteer', '/volunteer', '' +
    '<section class="page-hero">' +
      '<div class="container">' +
        '<p class="eyebrow">Volunteer With AEWS</p>' +
        '<h1>Turn your time and skills into visible social impact</h1>' +
        '<p>Join a structured volunteer network that supports classes, events, outreach, documentation, and community-building.</p>' +
      '</div>' +
    '</section>' +
    '<section class="section">' +
      '<div class="container form-layout">' +
        '<div class="stack-grid">' +
          '<article class="card soft-card"><h2>Benefits of Joining</h2>' + listItems(VOLUNTEER_BENEFITS) + '</article>' +
          '<article class="card soft-card"><h2>Volunteer Roles</h2>' + listItems(VOLUNTEER_ROLES) + '</article>' +
        '</div>' +
        '<form class="form-card" method="post" action="/volunteer">' +
          '<h2>Volunteer Application</h2>' +
          formField('Name', 'name', 'text', '', true) +
          formField('Phone', 'phone', 'tel', '', true) +
          formField('Email', 'email', 'email', '', true) +
          formField('City', 'city', 'text', '', true) +
          formField('Age', 'age', 'number', '', true) +
          selectField('Interest', 'interest', ['Teaching', 'Events', 'Outreach', 'Social Media', 'Operations'], true) +
          formField('Availability', 'availability', 'text', '', true, 'Weekdays / weekends / flexible') +
          textAreaField('Message', 'message', '', true, 'Tell us how you want to contribute') +
          '<button class="btn btn-primary" type="submit">Submit Volunteer Form</button>' +
        '</form>' +
      '</div>' +
    '</section>', content, flash);
}

function renderClassesPage(state, flash) {
  var content = state.content;
  var categoryChips = state.categories.map(function(category) {
    return '<span class="chip">' + helpers.escapeHtml(category.name) + '</span>';
  }).join('');

  var classCards = state.classes.map(function(item) {
    var embedUrl = helpers.youtubeEmbedUrl(item.videoUrl);
    return '<article class="class-card">' +
      '<div class="class-thumb">' +
        '<img src="' + helpers.escapeHtml(item.thumbnail || '/assets/aews-logo.jpg') + '" alt="' + helpers.escapeHtml(item.title) + '">' +
      '</div>' +
      '<div class="class-content">' +
        '<span class="tag">' + helpers.escapeHtml(findCategoryName(state.categories, item.categoryId)) + '</span>' +
        '<h3>' + helpers.escapeHtml(item.title) + '</h3>' +
        '<p>' + helpers.escapeHtml(item.description) + '</p>' +
        (embedUrl ? '<div class="video-wrap"><iframe src="' + helpers.escapeHtml(embedUrl) + '" title="' + helpers.escapeHtml(item.title) + '" loading="lazy" allowfullscreen></iframe></div>' : '') +
      '</div>' +
    '</article>';
  }).join('');

  return renderPublicLayout('Classes', '/classes', '' +
    '<section class="page-hero">' +
      '<div class="container">' +
        '<p class="eyebrow">Classes</p>' +
        '<h1>Explore structured learning tracks that build real capability</h1>' +
        '<p>Our learning offerings are organized into practical categories and can be updated dynamically through the admin panel.</p>' +
      '</div>' +
    '</section>' +
    '<section class="section">' +
      '<div class="container">' +
        '<div class="chip-row">' + categoryChips + '</div>' +
        '<div class="classes-grid">' + classCards + '</div>' +
      '</div>' +
    '</section>', content, flash);
}

function renderServicesPage(state, flash) {
  var content = state.content;
  var cards = SERVICE_CARDS.map(function(item) {
    return featureCard(item.title, item.description);
  }).join('');

  return renderPublicLayout('Services', '/services', '' +
    '<section class="page-hero">' +
      '<div class="container">' +
        '<p class="eyebrow">Services</p>' +
        '<h1>Professional support services backed by an impact-driven team</h1>' +
        '<p>' + helpers.escapeHtml(content.servicesIntro) + '</p>' +
      '</div>' +
    '</section>' +
    '<section class="section">' +
      '<div class="container form-layout">' +
        '<div class="stack-grid">' + (content.servicesImage ? '<article class="card image-card"><img src="' + helpers.escapeHtml(content.servicesImage) + '" alt="AEWS services"></article>' : '') + cards + '</div>' +
        '<form class="form-card" method="post" action="/services">' +
          '<h2>Request a Service</h2>' +
          formField('Name', 'name', 'text', '', true) +
          formField('Business Name', 'businessName', 'text', '', true) +
          formField('Phone', 'phone', 'tel', '', true) +
          selectField('Service Required', 'serviceRequired', ['Event Management', 'Customer Support / Calling', 'Backend Services (Tally / Data Entry)'], true) +
          textAreaField('Details', 'details', '', true, 'Share scope, goals, or timelines') +
          '<button class="btn btn-primary" type="submit">Submit Service Request</button>' +
        '</form>' +
      '</div>' +
    '</section>', content, flash);
}

function renderPartnerPage(state, flash) {
  var content = state.content;
  var options = DRIVE_TYPES.map(function(item) {
    return featureCard(item, 'Collaborate with AEWS to plan and deliver this drive with clarity, outreach, and execution support.');
  }).join('');

  return renderPublicLayout('Partner / Suggest Drive', '/partner', '' +
    '<section class="page-hero">' +
      '<div class="container">' +
        '<p class="eyebrow">Partnerships & Drives</p>' +
        '<h1>Bring a drive, partnership, or public initiative to life with AEWS</h1>' +
        '<p>' + helpers.escapeHtml(content.partnershipIntro) + '</p>' +
      '</div>' +
    '</section>' +
    '<section class="section">' +
      '<div class="container form-layout">' +
        '<div class="stack-grid">' + options + '</div>' +
        '<form class="form-card" method="post" action="/partner">' +
          '<h2>Partner / Suggest Drive</h2>' +
          formField('Name', 'name', 'text', '', true) +
          formField('Organization', 'organization', 'text', '', true) +
          formField('Phone', 'phone', 'tel', '', true) +
          selectField('Type of Drive', 'driveType', DRIVE_TYPES, true) +
          textAreaField('Description', 'description', '', true, 'What do you want to run and why?') +
          formField('Budget (optional)', 'budget', 'text', '', false) +
          '<button class="btn btn-primary" type="submit">Submit Partnership Request</button>' +
        '</form>' +
      '</div>' +
    '</section>', content, flash);
}

function renderDonationPage(state, flash) {
  var content = state.content;
  var gatewayButton = content.paymentGatewayUrl ? '<a class="btn btn-secondary" href="' + helpers.escapeHtml(content.paymentGatewayUrl) + '" target="_blank" rel="noopener">Open Payment Gateway</a>' : '<p class="muted">Payment gateway link can be added later from the admin CMS.</p>';
  return renderPublicLayout('Donate', '/donate', '' +
    '<section class="page-hero">' +
      '<div class="container">' +
        '<p class="eyebrow">Donate</p>' +
        '<h1>Fuel learning, outreach, and welfare-led community action</h1>' +
        '<p>' + helpers.escapeHtml(content.donationIntro) + '</p>' +
      '</div>' +
    '</section>' +
    '<section class="section">' +
      '<div class="container form-layout">' +
        '<div class="stack-grid">' +
          '<article class="card soft-card"><h2>Why Donate</h2><p>' + helpers.escapeHtml(content.donationIntro) + '</p></article>' +
          '<article class="card soft-card"><h2>How Contributions Are Used</h2><p>' + helpers.escapeHtml(content.donationUsage) + '</p></article>' +
          '<article class="card soft-card"><h2>Payment Options</h2><p><strong>UPI ID:</strong> ' + helpers.escapeHtml(content.upiId) + '</p><p><strong>Payee:</strong> ' + helpers.escapeHtml(content.upiPayee) + '</p>' + gatewayButton + '</article>' +
        '</div>' +
        '<form class="form-card" method="post" action="/donate">' +
          '<h2>Donation Pledge / Record</h2>' +
          formField('Name', 'name', 'text', '', true) +
          formField('Amount', 'amount', 'number', '', true) +
          formField('Phone', 'phone', 'tel', '', true) +
          textAreaField('Message', 'message', '', false, 'Any note for the AEWS team') +
          '<button class="btn btn-primary" type="submit">Save Donation Details</button>' +
        '</form>' +
      '</div>' +
    '</section>', content, flash);
}

function renderContactPage(state, flash) {
  var content = state.content;
  return renderPublicLayout('Contact', '/contact', '' +
    '<section class="page-hero">' +
      '<div class="container">' +
        '<p class="eyebrow">Contact</p>' +
        '<h1>Connect with AEWS for programs, support, or collaboration</h1>' +
        '<p>We would love to hear from volunteers, institutions, donors, and community partners.</p>' +
      '</div>' +
    '</section>' +
    '<section class="section">' +
      '<div class="container form-layout">' +
        '<div class="stack-grid">' +
          '<article class="card soft-card"><h2>Phone</h2><p>' + helpers.escapeHtml(content.contactPhone) + '</p></article>' +
          '<article class="card soft-card"><h2>Email</h2><p>' + helpers.escapeHtml(content.contactEmail) + '</p></article>' +
          '<article class="card soft-card"><h2>Location</h2><p>' + helpers.escapeHtml(content.contactAddress) + '</p></article>' +
          '<div class="map-card"><iframe src="' + helpers.escapeHtml(content.mapEmbedUrl) + '" loading="lazy"></iframe></div>' +
        '</div>' +
        '<form class="form-card" method="post" action="/contact">' +
          '<h2>Contact Form</h2>' +
          formField('Name', 'name', 'text', '', true) +
          formField('Phone', 'phone', 'tel', '', true) +
          formField('Email', 'email', 'email', '', true) +
          textAreaField('Message', 'message', '', true, 'How can we help?') +
          '<button class="btn btn-primary" type="submit">Send Message</button>' +
        '</form>' +
      '</div>' +
    '</section>', content, flash);
}

function renderAdminLogin(flash) {
  return '<!DOCTYPE html>' +
    '<html lang="en">' +
    '<head>' +
      '<meta charset="utf-8">' +
      '<meta name="viewport" content="width=device-width, initial-scale=1">' +
      '<title>AEWS Admin Login</title>' +
      '<link rel="stylesheet" href="/css/site.css">' +
    '</head>' +
    '<body class="login-body">' +
      '<div class="login-shell">' +
        '<div class="login-brand">' +
          '<img src="/assets/aews-logo.jpg" alt="AEWS Logo">' +
          '<p class="eyebrow">AEWS Admin Panel</p>' +
          '<h1>Secure access to CMS + CRM operations</h1>' +
          '<p>Manage volunteer leads, service requests, content, classes, media, and donation records from one place.</p>' +
        '</div>' +
        '<form class="login-card" method="post" action="/admin/login">' +
          '<h2>Admin Login</h2>' +
          flashMarkup(flash) +
          formField('Email', 'email', 'email', '', true) +
          formField('Password', 'password', 'password', '', true) +
          '<button class="btn btn-primary" type="submit">Login</button>' +
        '</form>' +
      '</div>' +
    '</body>' +
    '</html>';
}

function renderAdminDashboard(state, user, flash) {
  var cards = '' +
    adminMetric(state.volunteers.length, 'Total volunteers', 'Volunteer enquiries captured') +
    adminMetric(state.serviceRequests.length, 'Service requests', 'Businesses or clients in pipeline') +
    adminMetric(state.donations.length, 'Donations', 'Donation records stored') +
    adminMetric(state.partners.length, 'Partner requests', 'Drive and collaboration requests');

  var recent = state.activity.slice(0, 10).map(function(item) {
    return '<li><strong>' + helpers.escapeHtml(item.title) + '</strong><span>' + helpers.escapeHtml(item.detail || item.type) + '</span><time>' + helpers.formatDateTime(item.createdAt) + '</time></li>';
  }).join('');

  var pipeline = '' +
    pipelineChip(countByStatus(state.volunteers, 'status', 'New'), 'Volunteer New') +
    pipelineChip(countByStatus(state.volunteers, 'status', 'Contacted'), 'Volunteer Contacted') +
    pipelineChip(countByStatus(state.serviceRequests, 'status', 'In Progress'), 'Service In Progress') +
    pipelineChip(countByStatus(state.serviceRequests, 'status', 'Converted'), 'Service Converted') +
    pipelineChip(countByStatus(state.partners, 'status', 'Approved'), 'Partners Approved') +
    pipelineChip(countByStatus(state.donations, 'paymentStatus', 'Paid'), 'Paid Donations');

  return renderAdminLayout('Dashboard', 'dashboard', '' +
    '<section class="dashboard-grid">' + cards + '</section>' +
    '<section class="admin-section two-panel-admin">' +
      '<div class="admin-panel">' +
        '<div class="panel-head"><h2>Recent Activity</h2><p>Latest CRM, CMS, and system actions.</p></div>' +
        '<ul class="activity-list">' + (recent || '<li><strong>No activity yet.</strong><span>New submissions and updates will appear here.</span><time>-</time></li>') + '</ul>' +
      '</div>' +
      '<div class="admin-panel">' +
        '<div class="panel-head"><h2>Operational Snapshot</h2><p>Quick pipeline view across the platform.</p></div>' +
        '<div class="pipeline-grid">' + pipeline + '</div>' +
        '<div class="notice-card">' +
          '<p><strong>Default admin:</strong> ' + helpers.escapeHtml(user.email) + '</p>' +
          '<p>Update credentials in code or extend the admin user module before public deployment.</p>' +
        '</div>' +
      '</div>' +
    '</section>', user, flash);
}

function renderAdminVolunteers(state, user, flash, query) {
  var rows = filterRecords(state.volunteers, query.q, ['name', 'phone', 'email', 'city', 'interest'], 'status', query.status).map(function(item) {
    return '<tr>' +
      '<td>' + helpers.escapeHtml(item.name) + '</td>' +
      '<td>' + helpers.escapeHtml(item.phone) + '<br><small>' + helpers.escapeHtml(item.email) + '</small></td>' +
      '<td>' + helpers.escapeHtml(item.city) + ' / ' + helpers.escapeHtml(item.age) + '</td>' +
      '<td>' + helpers.escapeHtml(item.interest) + '<br><small>' + helpers.escapeHtml(item.availability) + '</small></td>' +
      '<td>' + helpers.escapeHtml(item.message) + '</td>' +
      '<td>' +
        '<form class="inline-form" method="post" action="/admin/volunteers/status">' +
          '<input type="hidden" name="id" value="' + helpers.escapeHtml(item.id) + '">' +
          '<select name="status">' + optionsHtml(['New', 'Contacted', 'Selected'], item.status) + '</select>' +
          '<button class="btn btn-secondary btn-small" type="submit">Save</button>' +
        '</form>' +
      '</td>' +
      '<td>' + helpers.formatDate(item.createdAt) + '</td>' +
    '</tr>';
  }).join('');

  return renderAdminLayout('Volunteer Management', 'volunteers', dataTablePanel(
    'Volunteer Leads',
    'Review applications, update status, and export data.',
    '/admin/volunteers',
    query,
    ['All', 'New', 'Contacted', 'Selected'],
    '/admin/export/volunteers.csv',
    '<table class="admin-table"><thead><tr><th>Name</th><th>Contact</th><th>City / Age</th><th>Interest</th><th>Message</th><th>Status</th><th>Date</th></tr></thead><tbody>' + (rows || emptyTableRow(7, 'No volunteer entries found.')) + '</tbody></table>'
  ), user, flash);
}

function renderAdminServiceRequests(state, user, flash, query) {
  var rows = filterRecords(state.serviceRequests, query.q, ['name', 'businessName', 'phone', 'serviceRequired', 'details'], 'status', query.status).map(function(item) {
    return '<tr>' +
      '<td>' + helpers.escapeHtml(item.name) + '</td>' +
      '<td>' + helpers.escapeHtml(item.businessName) + '</td>' +
      '<td>' + helpers.escapeHtml(item.phone) + '</td>' +
      '<td>' + helpers.escapeHtml(item.serviceRequired) + '</td>' +
      '<td>' + helpers.escapeHtml(item.details) + '</td>' +
      '<td>' +
        '<form class="inline-form" method="post" action="/admin/service-requests/status">' +
          '<input type="hidden" name="id" value="' + helpers.escapeHtml(item.id) + '">' +
          '<select name="status">' + optionsHtml(['New', 'In Progress', 'Converted', 'Completed'], item.status) + '</select>' +
          '<button class="btn btn-secondary btn-small" type="submit">Save</button>' +
        '</form>' +
      '</td>' +
      '<td>' + helpers.formatDate(item.createdAt) + '</td>' +
    '</tr>';
  }).join('');

  return renderAdminLayout('Client / Service Management', 'service-requests', dataTablePanel(
    'Service Leads',
    'Track service enquiries through the conversion pipeline.',
    '/admin/service-requests',
    query,
    ['All', 'New', 'In Progress', 'Converted', 'Completed'],
    '/admin/export/service-requests.csv',
    '<table class="admin-table"><thead><tr><th>Name</th><th>Business</th><th>Phone</th><th>Service</th><th>Details</th><th>Status</th><th>Date</th></tr></thead><tbody>' + (rows || emptyTableRow(7, 'No service enquiries found.')) + '</tbody></table>'
  ), user, flash);
}

function renderAdminPartners(state, user, flash, query) {
  var rows = filterRecords(state.partners, query.q, ['name', 'organization', 'phone', 'driveType', 'description', 'budget'], 'status', query.status).map(function(item) {
    return '<tr>' +
      '<td>' + helpers.escapeHtml(item.name) + '<br><small>' + helpers.escapeHtml(item.organization) + '</small></td>' +
      '<td>' + helpers.escapeHtml(item.phone) + '</td>' +
      '<td>' + helpers.escapeHtml(item.driveType) + '</td>' +
      '<td>' + helpers.escapeHtml(item.description) + '<br><small>Budget: ' + helpers.escapeHtml(item.budget || '-') + '</small></td>' +
      '<td>' +
        '<form class="stacked-inline-form" method="post" action="/admin/partners/update">' +
          '<input type="hidden" name="id" value="' + helpers.escapeHtml(item.id) + '">' +
          '<select name="status">' + optionsHtml(['New', 'Approved', 'Rejected'], item.status) + '</select>' +
          '<textarea name="notes" placeholder="Admin notes">' + helpers.escapeHtml(item.notes || '') + '</textarea>' +
          '<button class="btn btn-secondary btn-small" type="submit">Save</button>' +
        '</form>' +
      '</td>' +
      '<td>' + helpers.formatDate(item.createdAt) + '</td>' +
    '</tr>';
  }).join('');

  return renderAdminLayout('Partnership Management', 'partners', dataTablePanel(
    'Partnership & Drive Requests',
    'Review proposals, add notes, and approve or reject submissions.',
    '/admin/partners',
    query,
    ['All', 'New', 'Approved', 'Rejected'],
    '/admin/export/partners.csv',
    '<table class="admin-table"><thead><tr><th>Requester</th><th>Phone</th><th>Drive Type</th><th>Description</th><th>Review</th><th>Date</th></tr></thead><tbody>' + (rows || emptyTableRow(6, 'No partnership entries found.')) + '</tbody></table>'
  ), user, flash);
}

function renderAdminDonations(state, user, flash, query) {
  var rows = filterRecords(state.donations, query.q, ['name', 'phone', 'amount', 'message'], 'paymentStatus', query.status).map(function(item) {
    return '<tr>' +
      '<td>' + helpers.escapeHtml(item.name) + '</td>' +
      '<td>' + helpers.escapeHtml(item.phone) + '</td>' +
      '<td>Rs. ' + helpers.escapeHtml(item.amount) + '</td>' +
      '<td>' + helpers.escapeHtml(item.message || '-') + '</td>' +
      '<td>' +
        '<form class="inline-form" method="post" action="/admin/donations/status">' +
          '<input type="hidden" name="id" value="' + helpers.escapeHtml(item.id) + '">' +
          '<select name="paymentStatus">' + optionsHtml(['Pending', 'Paid', 'Failed'], item.paymentStatus) + '</select>' +
          '<button class="btn btn-secondary btn-small" type="submit">Save</button>' +
        '</form>' +
      '</td>' +
      '<td>' + helpers.formatDate(item.createdAt) + '</td>' +
    '</tr>';
  }).join('');

  return renderAdminLayout('Donation Management', 'donations', dataTablePanel(
    'Donation Records',
    'Track donors, amounts, and payment status.',
    '/admin/donations',
    query,
    ['All', 'Pending', 'Paid', 'Failed'],
    '/admin/export/donations.csv',
    '<table class="admin-table"><thead><tr><th>Name</th><th>Phone</th><th>Amount</th><th>Message</th><th>Payment Status</th><th>Date</th></tr></thead><tbody>' + (rows || emptyTableRow(6, 'No donation records found.')) + '</tbody></table>'
  ), user, flash);
}

function renderAdminContacts(state, user, flash, query) {
  var rows = filterRecords(state.contacts, query.q, ['name', 'phone', 'email', 'message'], '', '').map(function(item) {
    return '<tr>' +
      '<td>' + helpers.escapeHtml(item.name) + '</td>' +
      '<td>' + helpers.escapeHtml(item.phone) + '<br><small>' + helpers.escapeHtml(item.email) + '</small></td>' +
      '<td>' + helpers.escapeHtml(item.message) + '</td>' +
      '<td>' + helpers.formatDate(item.createdAt) + '</td>' +
    '</tr>';
  }).join('');

  return renderAdminLayout('Contact Messages', 'contacts', '' +
    '<section class="admin-panel">' +
      '<div class="panel-head">' +
        '<div><h2>Contact Form Enquiries</h2><p>Search recent messages and export the dataset.</p></div>' +
        '<a class="btn btn-secondary btn-small" href="/admin/export/contacts.csv">Export CSV</a>' +
      '</div>' +
      '<form class="filters" method="get" action="/admin/contacts">' +
        '<input type="search" name="q" value="' + helpers.escapeHtml(query.q || '') + '" placeholder="Search contacts">' +
        '<button class="btn btn-secondary btn-small" type="submit">Filter</button>' +
      '</form>' +
      '<table class="admin-table"><thead><tr><th>Name</th><th>Contact</th><th>Message</th><th>Date</th></tr></thead><tbody>' + (rows || emptyTableRow(4, 'No contact messages found.')) + '</tbody></table>' +
    '</section>', user, flash);
}

function renderAdminCategories(state, user, flash, query) {
  var editing = findById(state.categories, query.edit);
  var rows = state.categories.map(function(item) {
    return '<tr>' +
      '<td>' + helpers.escapeHtml(item.name) + '</td>' +
      '<td>' + helpers.escapeHtml(item.description) + '</td>' +
      '<td class="actions-cell">' +
        '<a class="btn btn-secondary btn-small" href="/admin/categories?edit=' + encodeURIComponent(item.id) + '">Edit</a>' +
        '<form method="post" action="/admin/categories/delete" onsubmit="return confirm(\'Delete this category?\')">' +
          '<input type="hidden" name="id" value="' + helpers.escapeHtml(item.id) + '">' +
          '<button class="btn btn-ghost btn-small" type="submit">Delete</button>' +
        '</form>' +
      '</td>' +
    '</tr>';
  }).join('');

  return renderAdminLayout('Classes Categories', 'categories', '' +
    '<section class="two-panel-admin">' +
      '<div class="admin-panel">' +
        '<div class="panel-head"><h2>' + (editing ? 'Edit Category' : 'Add Category') + '</h2><p>Organize classes into folders and learning tracks.</p></div>' +
        '<form class="admin-form" method="post" action="/admin/categories/save">' +
          '<input type="hidden" name="id" value="' + helpers.escapeHtml(editing ? editing.id : '') + '">' +
          formField('Category Name', 'name', 'text', editing ? editing.name : '', true) +
          textAreaField('Description', 'description', editing ? editing.description : '', true, 'Describe what this class category covers') +
          '<button class="btn btn-primary" type="submit">' + (editing ? 'Update Category' : 'Add Category') + '</button>' +
        '</form>' +
      '</div>' +
      '<div class="admin-panel">' +
        '<div class="panel-head"><h2>Existing Categories</h2><p>Current folders available on the classes page.</p></div>' +
        '<table class="admin-table"><thead><tr><th>Name</th><th>Description</th><th>Actions</th></tr></thead><tbody>' + (rows || emptyTableRow(3, 'No categories created yet.')) + '</tbody></table>' +
      '</div>' +
    '</section>', user, flash);
}

function renderAdminClasses(state, user, flash, query) {
  var editing = findById(state.classes, query.edit);
  var rows = state.classes.map(function(item) {
    return '<tr>' +
      '<td><img class="table-thumb" src="' + helpers.escapeHtml(item.thumbnail || '/assets/aews-logo.jpg') + '" alt="' + helpers.escapeHtml(item.title) + '"></td>' +
      '<td>' + helpers.escapeHtml(item.title) + '</td>' +
      '<td>' + helpers.escapeHtml(findCategoryName(state.categories, item.categoryId)) + '</td>' +
      '<td>' + helpers.escapeHtml(item.videoUrl || '-') + '</td>' +
      '<td class="actions-cell">' +
        '<a class="btn btn-secondary btn-small" href="/admin/classes?edit=' + encodeURIComponent(item.id) + '">Edit</a>' +
        '<form method="post" action="/admin/classes/delete" onsubmit="return confirm(\'Delete this class?\')">' +
          '<input type="hidden" name="id" value="' + helpers.escapeHtml(item.id) + '">' +
          '<button class="btn btn-ghost btn-small" type="submit">Delete</button>' +
        '</form>' +
      '</td>' +
    '</tr>';
  }).join('');

  return renderAdminLayout('Classes Management', 'classes', '' +
    '<section class="two-panel-admin">' +
      '<div class="admin-panel">' +
        '<div class="panel-head"><h2>' + (editing ? 'Edit Class' : 'Add Class') + '</h2><p>Create and update class cards, thumbnails, and YouTube embeds.</p></div>' +
        '<form class="admin-form" method="post" action="/admin/classes/save">' +
          '<input type="hidden" name="id" value="' + helpers.escapeHtml(editing ? editing.id : '') + '">' +
          formField('Title', 'title', 'text', editing ? editing.title : '', true) +
          '<label>Category<select name="categoryId" required>' + state.categories.map(function(item) {
            return '<option value="' + helpers.escapeHtml(item.id) + '"' + (editing && item.id === editing.categoryId ? ' selected' : '') + '>' + helpers.escapeHtml(item.name) + '</option>';
          }).join('') + '</select></label>' +
          formField('Thumbnail URL', 'thumbnail', 'text', editing ? editing.thumbnail : '', false, 'Existing image URL or leave blank to upload') +
          uploadField('Thumbnail Upload', 'thumbnailData') +
          formField('YouTube Video Link', 'videoUrl', 'text', editing ? editing.videoUrl : '', false) +
          textAreaField('Description', 'description', editing ? editing.description : '', true, 'Short class description') +
          '<button class="btn btn-primary" type="submit">' + (editing ? 'Update Class' : 'Add Class') + '</button>' +
        '</form>' +
      '</div>' +
      '<div class="admin-panel">' +
        '<div class="panel-head"><h2>Existing Classes</h2><p>All class cards currently visible on the public website.</p></div>' +
        '<table class="admin-table"><thead><tr><th>Thumb</th><th>Title</th><th>Category</th><th>Video</th><th>Actions</th></tr></thead><tbody>' + (rows || emptyTableRow(5, 'No classes created yet.')) + '</tbody></table>' +
      '</div>' +
    '</section>', user, flash);
}

function renderAdminContent(state, user, flash) {
  var content = state.content;
  return renderAdminLayout('CMS Management', 'content', '' +
    '<section class="admin-panel">' +
      '<div class="panel-head"><h2>Website Content</h2><p>Update homepage copy, About text, service messaging, donation settings, and contact details.</p></div>' +
      '<form class="admin-form cms-form" method="post" action="/admin/content/save">' +
        formField('Site Name', 'siteName', 'text', content.siteName, true) +
        formField('Short Name', 'siteShortName', 'text', content.siteShortName, true) +
        formField('Tagline', 'tagline', 'text', content.tagline, true) +
        textAreaField('Hero Text', 'heroText', content.heroText, true, 'Homepage subtext') +
        textAreaField('About Intro', 'aboutIntro', content.aboutIntro, true, 'Short about section') +
        textAreaField('About Full', 'aboutFull', content.aboutFull, true, 'Full about page content') +
        textAreaField('Work Areas (one per line)', 'workAreas', (content.workAreas || []).join('\n'), true, 'Education, skills, events, placement, etc.') +
        formField('Impact Volunteers', 'impactVolunteers', 'text', content.impactVolunteers, true) +
        formField('Impact Events', 'impactEvents', 'text', content.impactEvents, true) +
        formField('Impact Beneficiaries', 'impactBeneficiaries', 'text', content.impactBeneficiaries, true) +
        textAreaField('Services Intro', 'servicesIntro', content.servicesIntro, true, '') +
        textAreaField('Partnership Intro', 'partnershipIntro', content.partnershipIntro, true, '') +
        textAreaField('Donation Intro', 'donationIntro', content.donationIntro, true, '') +
        textAreaField('Donation Usage', 'donationUsage', content.donationUsage, true, '') +
        formField('Contact Phone', 'contactPhone', 'text', content.contactPhone, true) +
        formField('Contact Email', 'contactEmail', 'email', content.contactEmail, true) +
        formField('Notification Email', 'notificationEmail', 'email', content.notificationEmail, true, 'Used for queued form notifications') +
        formField('Contact Address', 'contactAddress', 'text', content.contactAddress, true) +
        formField('WhatsApp Number', 'whatsappNumber', 'text', content.whatsappNumber, true, 'Use country code, numbers only') +
        formField('Map Embed URL', 'mapEmbedUrl', 'text', content.mapEmbedUrl, true) +
        formField('UPI ID', 'upiId', 'text', content.upiId, true) +
        formField('UPI Payee', 'upiPayee', 'text', content.upiPayee, true) +
        formField('Payment Gateway URL', 'paymentGatewayUrl', 'text', content.paymentGatewayUrl, false, 'Optional external payment page') +
        formField('Trust Text', 'trustText', 'text', content.trustText, true) +
        formField('Certificate Title', 'certificateTitle', 'text', content.certificateTitle, true) +
        formField('Hero Image URL', 'heroImage', 'text', content.heroImage, false) +
        formField('About Image URL', 'aboutImage', 'text', content.aboutImage, false) +
        formField('Services Image URL', 'servicesImage', 'text', content.servicesImage, false) +
        '<button class="btn btn-primary" type="submit">Save CMS Content</button>' +
      '</form>' +
    '</section>', user, flash);
}

function renderAdminMedia(state, user, flash) {
  var cards = state.media.map(function(item) {
    return '<article class="media-card">' +
      '<img src="' + helpers.escapeHtml(item.url) + '" alt="' + helpers.escapeHtml(item.title) + '">' +
      '<h3>' + helpers.escapeHtml(item.title) + '</h3>' +
      '<p>' + helpers.escapeHtml(item.url) + '</p>' +
      '<form method="post" action="/admin/media/delete" onsubmit="return confirm(\'Delete this media item?\')">' +
        '<input type="hidden" name="id" value="' + helpers.escapeHtml(item.id) + '">' +
        '<button class="btn btn-ghost btn-small" type="submit">Delete</button>' +
      '</form>' +
    '</article>';
  }).join('');

  return renderAdminLayout('Media Library', 'media', '' +
    '<section class="two-panel-admin">' +
      '<div class="admin-panel">' +
        '<div class="panel-head"><h2>Upload Media</h2><p>Add images that can be reused across classes and content areas.</p></div>' +
        '<form class="admin-form" method="post" action="/admin/media/save">' +
          formField('Title', 'title', 'text', '', true) +
          uploadField('Image Upload', 'fileData') +
          '<button class="btn btn-primary" type="submit">Upload to Library</button>' +
        '</form>' +
      '</div>' +
      '<div class="admin-panel">' +
        '<div class="panel-head"><h2>Available Media</h2><p>Reuse URLs in classes or CMS image fields.</p></div>' +
        '<div class="media-grid">' + (cards || '<p class="muted">No media uploaded yet.</p>') + '</div>' +
      '</div>' +
    '</section>', user, flash);
}

function flashMarkup(flash) {
  if (!flash || (!flash.notice && !flash.error)) {
    return '';
  }

  return '<div class="container flash-wrap">' +
    (flash.notice ? '<div class="flash flash-success">' + helpers.escapeHtml(flash.notice) + '</div>' : '') +
    (flash.error ? '<div class="flash flash-error">' + helpers.escapeHtml(flash.error) + '</div>' : '') +
  '</div>';
}

function navLinks(pathName) {
  var links = [
    ['/', 'Home'],
    ['/about', 'About'],
    ['/volunteer', 'Volunteer'],
    ['/classes', 'Classes'],
    ['/services', 'Services'],
    ['/partner', 'Partner'],
    ['/contact', 'Contact']
  ];

  return links.map(function(item) {
    return '<a' + (item[0] === pathName ? ' class="active"' : '') + ' href="' + item[0] + '">' + item[1] + '</a>';
  }).join('');
}

function adminNavLink(href, key, currentSection, label) {
  return '<a' + (key === currentSection ? ' class="active"' : '') + ' href="' + href + '">' + label + '</a>';
}

function whatsappButton(number) {
  if (!number) {
    return '';
  }

  return '<a class="whatsapp-float" href="https://wa.me/' + helpers.escapeHtml(number) + '" target="_blank" rel="noopener">WhatsApp</a>';
}

function statTile(value, label) {
  return '<div class="mini-stat"><strong>' + helpers.escapeHtml(value) + '</strong><span>' + helpers.escapeHtml(label) + '</span></div>';
}

function statCard(value, label, description) {
  return '<article class="stat-card"><strong data-counter>' + helpers.escapeHtml(value) + '</strong><h3>' + helpers.escapeHtml(label) + '</h3><p>' + helpers.escapeHtml(description) + '</p></article>';
}

function featureCard(title, description) {
  return '<article class="card feature-card"><h3>' + helpers.escapeHtml(title) + '</h3><p>' + helpers.escapeHtml(description) + '</p></article>';
}

function actionCard(href, title, description) {
  return '<a class="action-card" href="' + href + '"><h3>' + helpers.escapeHtml(title) + '</h3><p>' + helpers.escapeHtml(description) + '</p><span>Continue</span></a>';
}

function listItems(items) {
  return '<ul class="clean-list">' + (items || []).map(function(item) {
    return '<li>' + helpers.escapeHtml(item) + '</li>';
  }).join('') + '</ul>';
}

function listFeatureCards(items) {
  return (items || []).map(function(item) {
    return featureCard(item, 'This focus area can be updated from the AEWS admin CMS.');
  }).join('');
}

function findCategoryName(categories, categoryId) {
  var item = findById(categories, categoryId);
  return item ? item.name : 'General';
}

function findById(items, id) {
  var i;
  if (!id) {
    return null;
  }
  for (i = 0; i < items.length; i += 1) {
    if (String(items[i].id) === String(id)) {
      return items[i];
    }
  }
  return null;
}

function formField(label, name, type, value, required, placeholder) {
  return '<label>' + helpers.escapeHtml(label) +
    '<input type="' + helpers.escapeHtml(type) + '" name="' + helpers.escapeHtml(name) + '" value="' + helpers.escapeHtml(value || '') + '"' + (placeholder ? ' placeholder="' + helpers.escapeHtml(placeholder) + '"' : '') + (required ? ' required' : '') + '>' +
  '</label>';
}

function selectField(label, name, options, required) {
  return '<label>' + helpers.escapeHtml(label) +
    '<select name="' + helpers.escapeHtml(name) + '"' + (required ? ' required' : '') + '>' +
      '<option value="">Select</option>' +
      options.map(function(item) {
        return '<option value="' + helpers.escapeHtml(item) + '">' + helpers.escapeHtml(item) + '</option>';
      }).join('') +
    '</select>' +
  '</label>';
}

function textAreaField(label, name, value, required, placeholder) {
  return '<label>' + helpers.escapeHtml(label) +
    '<textarea name="' + helpers.escapeHtml(name) + '"' + (placeholder ? ' placeholder="' + helpers.escapeHtml(placeholder) + '"' : '') + (required ? ' required' : '') + '>' + helpers.escapeHtml(value || '') + '</textarea>' +
  '</label>';
}

function uploadField(label, hiddenName) {
  return '<div class="upload-field" data-upload-field>' +
    '<label>' + helpers.escapeHtml(label) +
      '<input type="file" accept="image/*" data-upload-input>' +
    '</label>' +
    '<input type="hidden" name="' + helpers.escapeHtml(hiddenName) + '" data-upload-target>' +
    '<p class="muted" data-upload-status>No file selected yet.</p>' +
  '</div>';
}

function adminMetric(value, label, description) {
  return '<article class="metric-card"><strong>' + helpers.escapeHtml(value) + '</strong><h2>' + helpers.escapeHtml(label) + '</h2><p>' + helpers.escapeHtml(description) + '</p></article>';
}

function pipelineChip(value, label) {
  return '<div class="pipeline-chip"><strong>' + helpers.escapeHtml(value) + '</strong><span>' + helpers.escapeHtml(label) + '</span></div>';
}

function countByStatus(items, field, target) {
  return items.filter(function(item) {
    return String(item[field] || '') === String(target);
  }).length;
}

function filterRecords(records, queryText, keys, statusField, statusValue) {
  var text = String(queryText || '').toLowerCase();
  var status = String(statusValue || '');

  return records.filter(function(item) {
    var matchesText = true;
    var matchesStatus = true;

    if (text) {
      matchesText = keys.some(function(key) {
        return String(item[key] || '').toLowerCase().indexOf(text) !== -1;
      });
    }

    if (statusField && status && status !== 'All') {
      matchesStatus = String(item[statusField] || '') === status;
    }

    return matchesText && matchesStatus;
  });
}

function optionsHtml(options, selected) {
  return options.map(function(item) {
    return '<option value="' + helpers.escapeHtml(item) + '"' + (String(item) === String(selected) ? ' selected' : '') + '>' + helpers.escapeHtml(item) + '</option>';
  }).join('');
}

function dataTablePanel(title, description, actionPath, query, statusOptions, exportPath, tableHtml) {
  return '' +
    '<section class="admin-panel">' +
      '<div class="panel-head">' +
        '<div><h2>' + helpers.escapeHtml(title) + '</h2><p>' + helpers.escapeHtml(description) + '</p></div>' +
        '<a class="btn btn-secondary btn-small" href="' + exportPath + '">Export CSV</a>' +
      '</div>' +
      '<form class="filters" method="get" action="' + actionPath + '">' +
        '<input type="search" name="q" value="' + helpers.escapeHtml(query.q || '') + '" placeholder="Search records">' +
        '<select name="status"><option value="">All statuses</option>' + statusOptions.filter(function(option) {
          return option !== 'All';
        }).map(function(option) {
          return '<option value="' + helpers.escapeHtml(option) + '"' + (String(query.status || '') === option ? ' selected' : '') + '>' + helpers.escapeHtml(option) + '</option>';
        }).join('') + '</select>' +
        '<button class="btn btn-secondary btn-small" type="submit">Filter</button>' +
      '</form>' +
      tableHtml +
    '</section>';
}

function emptyTableRow(colspan, message) {
  return '<tr><td colspan="' + colspan + '" class="empty-cell">' + helpers.escapeHtml(message) + '</td></tr>';
}

module.exports = {
  renderHomePage: renderHomePage,
  renderAboutPage: renderAboutPage,
  renderVolunteerPage: renderVolunteerPage,
  renderClassesPage: renderClassesPage,
  renderServicesPage: renderServicesPage,
  renderPartnerPage: renderPartnerPage,
  renderDonationPage: renderDonationPage,
  renderContactPage: renderContactPage,
  renderAdminLogin: renderAdminLogin,
  renderAdminDashboard: renderAdminDashboard,
  renderAdminVolunteers: renderAdminVolunteers,
  renderAdminServiceRequests: renderAdminServiceRequests,
  renderAdminPartners: renderAdminPartners,
  renderAdminDonations: renderAdminDonations,
  renderAdminContacts: renderAdminContacts,
  renderAdminCategories: renderAdminCategories,
  renderAdminClasses: renderAdminClasses,
  renderAdminContent: renderAdminContent,
  renderAdminMedia: renderAdminMedia
};
