# LinguaLeap

An original language-learning student project built with React, Vite, TypeScript, Express, Prisma and SQLite. The production setup serves the client and API from one Render web service and stores SQLite on a persistent disk.

## Run locally (Windows PowerShell)

```powershell
npm install
Copy-Item .env.example server/.env
# Edit server/.env and set a long, random JWT_SECRET.
npm run db:setup -w server
npm run seed
npm run dev
```

Open http://localhost:5173. With no SMTP credentials, local development prints the one-time code in the API terminal. To test actual email delivery locally, set the Gmail SMTP values described below. Stop both servers with Ctrl+C.

Root scripts: `npm run dev`, `npm run build`, `npm test`, `npm run seed`.

## Email verification

Sign-up asks for a name, email, and password, then verifies the email with a six-digit OTP before signing in. Later logins use email and password. Passwords are bcrypt-hashed. OTP codes expire after 10 minutes, are stored as keyed hashes, allow at most five tries, and can be resent once per minute. Older passwordless accounts receive one email code on first login to set a password. Production refuses to send a code when SMTP is not configured. Configure a Gmail account with 2-Step Verification, create a Google App Password, and set `SMTP_USER`, `SMTP_APP_PASSWORD`, and `SMTP_FROM`. Keep the app password in `server/.env` locally or in the hosting provider's secret settings; never commit it. Google may revoke app passwords when the Google Account password changes. See [Google's App Password instructions](https://support.google.com/accounts/answer/185833).

## Publish to GitHub and deploy

1. Create an **empty public** GitHub repository named `lingualeap` (do not initialize it with a README or license).
2. From this project folder, verify that `.env`, `server/.env`, `*.db`, `node_modules`, and `.npm-cache` are not staged. Then push:

   ```powershell
   git status --short
   git add .
   git status --short
   git commit -m "Build LinguaLeap learning app"
   git branch -M main
   git remote add origin https://github.com/YOUR_GITHUB_NAME/lingualeap.git
   git push -u origin main
   ```

3. In Render, choose **New → Blueprint**, connect the public repository, and apply its `render.yaml`. The blueprint creates one web service with a persistent 1 GB disk for SQLite. Render's persistent disks are only available on paid services; without persistent storage, learners' accounts and progress can disappear on restarts or deploys. Check the current plan and price in your Render dashboard before confirming. See [Render's Node/Express deployment guide](https://render.com/docs/deploy-node-express-app) and [persistent disk docs](https://render.com/docs/disks).
4. When Render asks for the unsynced environment values, enter the Gmail address, Gmail App Password, and `SMTP_FROM` (for example `LinguaLeap <you@gmail.com>`). Set `SMTP_FROM` to the same Gmail address. Do not paste secrets into GitHub or this chat.
5. Wait for the deploy and open its `onrender.com` URL. Run the seed once from the Render service shell with `npm run seed`; then test sign-up, email verification, login, and lesson progress using a second email account.

The service serves the built React app and `/api` from the same origin. Future pushes to the connected GitHub branch trigger a redeploy. `render.yaml` sets `DATABASE_URL` to the mounted disk and generates `JWT_SECRET` for the service.

## Architecture

- `client/`: responsive React UI, React Router and Vite.
- `server/`: REST API, auth, OTP email delivery, answer validation, progress and gamification.
- `server/prisma/schema.prisma`: SQLite data model.
- `server/seed/*.json`: editable beginner vocabulary per language.
- `server/prisma/seed.ts`: expands the language files into five courses, 15 units, 45 lessons and 360 exercises.

## Screenshots

Add screenshots of the landing page, course path, and lesson player here.

Student project for LC26MCA F107, LEAD College of Management. Not affiliated with any language-learning brand.
