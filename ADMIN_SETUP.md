# PTEC NoteBOT admin setup

The app's connection is already configured for project **xhvubukgjbyrueufvpsg** using the URL and public key you supplied. Complete the steps below in that same project. If you choose a different project, update both values in `supabase-config.js` first; the key must belong to that project.

## 1. Run the database setup

1. Open [the project's SQL Editor](https://supabase.com/dashboard/project/xhvubukgjbyrueufvpsg/sql/new) and sign in if needed.
2. Open `E:\chat gpt astra\supabase-schema.sql` in a text editor. Click inside the code, press **Ctrl+A**, then **Ctrl+C** to copy the entire file.
3. In Supabase, create a blank SQL query. Click inside its editor and press **Ctrl+V**.
4. Click **Run**. A successful run normally reports **Success. No rows returned.**

This creates the materials table, administrator access rules, upload bucket, public game leaderboards, and private saved jokes. It does not create an admin login. The script can be run again safely; rerun it when the app receives a new schema feature. If Supabase reports an error, copy the error message for troubleshooting.

If the main schema was already installed before the game leaderboard was added, run [leaderboard-schema.sql](<E:\chat gpt astra\leaderboard-schema.sql>) separately in a new SQL Editor query.

After updating an older deployment, run the complete contents of the local `security-hardening.sql` file once in Supabase SQL Editor. It hides removed materials from the public API, removes direct public leaderboard inserts, validates scores through an RPC, and requires HTTPS resource links.

The migration also removes public execution rights from the setup-only `rls_auto_enable()` helper and combines the two authenticated material-read rules. In Supabase **Authentication → Sign In / Providers → Password**, turn on **Leaked password protection** as well; that setting cannot be enabled from the SQL migration.

If the main schema was already installed before saved jokes were added, run [joke-favorites-schema.sql](<E:\chat gpt astra\joke-favorites-schema.sql>) in a new SQL Editor query. Copy the **entire SQL contents** of the file into the editor, not the filename.

If the main schema was installed before the expanded content manager was added, run [admin-content-expansion.sql](<E:\chat gpt astra\admin-content-expansion.sql>) once in a new SQL Editor query. It adds Free Courses, Library and Phonebook fields, plus important and display-order controls. A successful run reports **Success. No rows returned.**

Supabase documents running queries in its [Dashboard SQL Editor](https://supabase.com/docs/guides/database/overview).

## 2. Create your administrator account

1. In the same project, open **Authentication → Users**.
2. Choose **Add user → Create new user** and enter your administrator email and a password. Keep the password private.
3. Confirm the email using the dashboard option if available, or complete email confirmation.
4. Copy the created user's **User UID** (a UUID).

In a new SQL query, paste the following. Replace `AUTH_USER_UUID_HERE` with that exact User UID, keeping the single quotes, then click **Run**:

```sql
insert into public.admin_profiles (user_id, role)
values ('AUTH_USER_UUID_HERE', 'admin')
on conflict (user_id) do nothing;
```

Creating an authentication user alone does not grant editing access. The SQL above approves that account as an administrator.

## 3. Log in and check the content manager

1. Open `PTEC_NoteBOT_fixed.html` and choose **Admin** from the menu.
2. Log in with the email and password you created.
3. Choose a category in the manager: **Notes, Lab Reports, Q-Bank, Syllabus, Free Courses, Library or PTEC Phonebook**.
4. Click **Add new**, enter the title and category details, then add text, a YouTube/Drive link or an upload. For a note, select one or more departments to load their combined folder list. After choosing a subject, use **Publish in these folders** to keep one destination or select all destinations. If the same subject is taught across both terms of a level, choose **Add this subject to every matching department in this level**; for example, FME in Level 2 automatically targets the matching Level 2 departments across `2-1` and `2-2`. You can mark an item **Important**, set its display order, edit it later, remove it, or restore it from **Removed content**.
5. Visit the corresponding public section and check the saved content. Existing visitors receive updates automatically, normally within a minute or when returning to the browser window.

Admins can add and edit notes, questions, lab reports, Q-Bank items, syllabuses, free courses, library links and phonebook contacts, including existing built-in files. Files can be PDFs or JPEG, PNG, or WebP images up to 20 MB. The original page styling is retained. Official BUTEX notices continue to come from BUTEX separately.

The three games use the `leaderboards` table. When a player reaches a qualifying result, the game offers a name field with the suggestion `Name, Batch No., Department`. Tic Tac Toe records wins, Paper Pilot records points, and Memory Match converts the completed move count into a higher-is-better score. The leaderboard is public to read; submissions go through the `submit_leaderboard_score` database function, which checks the game, score range, name length and a short per-name rate limit. Because game logic runs in the browser, a determined person can still fabricate a plausible score; server-side replay validation would be required for prize-level competition.

The Jokes page can keep showing textile jokes and meme captions. Saved jokes use Supabase Auth and are private to the signed-in account. The Jokes page keeps its login form hidden; use **Continue with Google** from the entry popup or the More menu, then use the same Google account on another device. This account is separate from the administrator session and does not grant administrator access. For a published site, set its HTTPS address as the Supabase Authentication Site URL.

The entry screen and More menu also include **Continue with Google**. To activate it, open Supabase **Authentication → Providers → Google**, create a Google OAuth Web client, add the deployed site origin to its authorized JavaScript origins, add Supabase's callback URL to its authorized redirect URIs, and paste the Google Client ID and Secret into the Google provider. Supabase's setup guide shows these provider and redirect steps: [Sign in with Google](https://supabase.com/docs/guides/auth/social-login/auth-google). Google sign-in needs the published HTTPS URL; the local `file://` preview shows a helpful message instead.

In Supabase **Authentication → URL Configuration**, set the deployed homepage as **Site URL** and add both the homepage and a wildcard for every client-side route under **Redirect URLs**. For this site, add `https://ptecnotebot.netlify.app/` and `https://ptecnotebot.netlify.app/**`. If you use another domain, replace the hostname in both entries. The app can start Google login from `/jokes`, `/settings`, `/games` or another route, so allowing only `/` can reject those callbacks.

**Remove** hides a material from the public listing; **Removed materials** lets an admin restore it. Uploaded files are public, and removing a listing does not erase the file or make its URL private.

## Keep these files together

Keep `PTEC_NoteBOT_fixed.html`, `logo.png`, `supabase-config.js`, `leaderboard.js`, `jokes.js`, and `paper-pilot.html` in the same folder. When publishing, use HTTPS and include all six files. Rename a copy of `PTEC_NoteBOT_fixed.html` to `index.html` for the site homepage. Keep `ADMIN_SETUP.md` alongside them if you want its setup link available. Internet access is required for Supabase, uploads, saved jokes, and live notices.

Only a public publishable or legacy anon key belongs in `supabase-config.js`. Do not put a secret/service-role key or a password there. Database policies enforce administrator access. The admin session is kept in session storage and ends when that browser session closes. If a Google OAuth client secret was ever exposed in a screenshot or chat, regenerate it in Google Cloud and replace it in Supabase Authentication → Providers → Google.

## If login does not work

- **Login failed:** check your email, password, email confirmation, and selected project.
- **This account has not been approved:** run the admin approval query with the user's correct UID.
- **Admin access could not be verified:** check that the complete schema ran in the same project as the app's connection.
- **Connection error:** check internet access and that the Supabase project is running.

Local automated checks cover the admin workflow. Live login and database permissions still need to be checked after these setup steps are complete.
