# LinguaLeap

An original language-learning student project built with React, Vite, TypeScript, Express, Prisma and SQLite/PostgreSQL.

## Run locally (Windows PowerShell)

```powershell
npm install
Copy-Item .env.example server/.env
# Set a long random JWT_SECRET in server/.env.
npm run db:setup -w server
npm run seed
npm run dev
```

Open http://localhost:5173. For local development, OTP codes are printed in the API terminal if SMTP is not configured. To send real email, set Gmail SMTP values in `server/.env`. Stop both servers with Ctrl+C.

Root scripts: `npm run dev`, `npm run build`, `npm test`, `npm run seed`.

## Free online deployment (Vercel + Neon)

This setup uses Vercel Hobby and a Neon free PostgreSQL database. It provides a free `*.vercel.app` URL; a custom domain is optional and usually costs money. Free-plan quotas and provider terms can change, and exceeding limits may require an upgrade. Vercel Hobby is for personal, non-commercial projects. Vercel serves the React build from its CDN and runs the Express API as a serverless function. Production data lives in PostgreSQL, never in the function filesystem.

1. Create a Neon project at [neon.tech](https://neon.tech), copy its pooled connection string and direct connection string, and keep both private.
2. In [Vercel](https://vercel.com), import `SOLOMON200404/lingualeap` from GitHub. Keep the project root at `./`; `vercel.json` contains the build and routing setup.
3. Add these Vercel environment variables for **Production** (and Preview if you want preview URLs to work):

   | Variable | Value |
   | --- | --- |
   | `DATABASE_URL` | Neon pooled PostgreSQL connection URL |
   | `DIRECT_URL` | Neon direct PostgreSQL connection URL |
   | `JWT_SECRET` | A newly generated, long random secret |
   | `SMTP_HOST` | `smtp.gmail.com` |
   | `SMTP_PORT` | `465` |
   | `SMTP_USER` | The Gmail sender address |
   | `SMTP_APP_PASSWORD` | A Google App Password (not your Gmail login password) |
   | `SMTP_FROM` | `LinguaLeap <sender@gmail.com>` using the same sender |

4. Deploy. The build generates the PostgreSQL Prisma client and creates/updates the database schema. Once the first deployment is ready, seed the course content once from PowerShell in this repo. Temporarily enter the Neon URLs in PowerShell (input is hidden), then run the seed command:

   ```powershell
   $env:DATABASE_URL = Read-Host "Neon pooled DATABASE_URL"
   $env:DIRECT_URL = Read-Host "Neon direct DIRECT_URL"
   npm run seed:vercel
   Remove-Item Env:DATABASE_URL, Env:DIRECT_URL
   ```

   This seeds five courses, 15 units, 45 lessons and 360 exercises. The database URLs include credentials; do not share terminal screenshots.
5. Open the Vercel deployment URL and test signup, OTP email, login and a lesson. Redeployments do not rerun the seed command.

Use a newly generated `JWT_SECRET` and a newly generated Gmail App Password for the deployed project. Never commit credentials or paste them into chat. Vercel Functions have a read-only filesystem, so the app's local SQLite database is deliberately not used in production. See [Vercel Express deployment](https://vercel.com/docs/frameworks/backend/express), [Vercel Functions filesystem limits](https://vercel.com/docs/functions/runtimes), [Vercel Hobby plan](https://vercel.com/docs/plans/hobby), and [Neon](https://neon.tech/pricing).

## Email verification

Sign-up verifies the learner's email using a six-digit OTP before signing in. Later logins use email and password. Passwords are bcrypt-hashed. OTP codes expire after 10 minutes, are stored as keyed hashes, allow at most five tries, and can be resent once per minute. Configure Gmail with 2-Step Verification and an App Password. Keep SMTP credentials in local `server/.env` or the hosting provider's secret settings. See [Google App Password instructions](https://support.google.com/accounts/answer/185833).

## Architecture

- `client/`: responsive React UI, React Router and Vite.
- `server/`: REST API, auth, OTP email delivery, answer validation, progress and gamification.
- `server/prisma/schema.prisma`: local SQLite data model.
- `server/prisma/schema.postgresql.prisma`: production PostgreSQL model for Vercel.
- `server/seed/*.json`: editable beginner vocabulary per language.
- `server/prisma/seed.ts`: expands the language files into five courses, 15 units, 45 lessons and 360 exercises.
- `vercel.json`: Vercel API/static routing and build configuration.

## Screenshots

Add screenshots of the landing page, course path, and lesson player here.

Student project for LC26MCA F107, LEAD College of Management. Not affiliated with any language-learning brand.
