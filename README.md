# AEWS Platform

AEWS Platform is a dynamic website plus admin panel for **Awadh Educational Welfare Society (AEWS)**. It includes:

- Public NGO website with responsive pages and lead-generation forms
- Admin login and dashboard
- Volunteer, service, partnership, donation, and contact lead management
- Classes and categories management
- CMS content editing
- Media library
- CSV exports
- File-backed data storage inside the `data/` folder

## Run locally

```powershell
npm start
```

The app runs at:

```text
http://localhost:3000
```

## Default admin login

```text
Email: admin@aews.org
Password: ChangeMe123!
```

## Project structure

- `server.js` - HTTP server, routes, form handling, admin actions
- `lib/` - auth, storage, rendering helpers
- `public/` - CSS, JS, uploaded media, AEWS assets
- `data/` - content, CRM records, sessions, activity, media, users

## Notes

- Form notifications are queued into `data/notifications.json`.
- The payment gateway button is configurable from the CMS using `Payment Gateway URL`.
- The public certificate PDF and AEWS logo are stored under `public/assets/`.
