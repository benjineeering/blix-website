# blix website

The website of **blix** — film lab, studio & space in Munich.
Built with [Astro](https://astro.build), hosted on GitHub Pages, edited with [Sveltia CMS](https://sveltiacms.app).

---

## ✏️ Editing the website (no coding needed)

1. Open **`<website address>/admin/`** (e.g. `https://www.blixmunich.de/admin/`).
2. Click **Sign In Using Access Token** and follow the link it shows to create a GitHub token (you need to be a member of the GitHub repository — ask Ben). The token is remembered in your browser.
3. Edit, then press **Save**. The website updates automatically **2–3 minutes** later.

| What you want to change | Where in the editor |
| --- | --- |
| Opening hours, address, Instagram/newsletter/store/booking links, contact form key | **Site settings** |
| Home page headline, intro and photo | **Home page** |
| Lab, Studio or Space prices, texts, photos | **Lab, Studio & Space** |
| Add a workshop / photo walk / party | **Events → New Event** |
| Write a blog post | **Blog → New Post** |
| Impressum, AGB, Datenschutz | **Legal pages (German)** |

**English & German.** The site has an English version (`/`) and a German one (`/de/`), with an EN / DE switch in the header.

- In the editor every event, post and page has an **English and a German** side. Only English is required.
- Anything left empty in German shows the English text on the German site (with a small "only available in English" note on events and posts), so you can publish in English first and translate later — or never.
- Dates, photos, ticket and booking links are shared: you only enter them on the English side.
- The **Translate** button (top of the German side, or next to each field) pre-fills the German from the English. The first time, it asks for a translation API key — e.g. a free [Google Cloud Translation](https://cloud.google.com/translate) key (500,000 characters/month free). The key stays in your browser. Always read the result before saving.
- The legal pages are German only and are shown on both versions.

**Good to know**

- **Events** sort themselves: upcoming events show under *Coming up*, finished ones move to the archive automatically (the site rebuilds every night). The ticket button disappears once an event is over.
- Leave **Starts at** empty for all-day things like deadlines. Leave **Location** empty if it's at blix.
- Tick **Draft** to save something without showing it on the website yet.
- **Photos** are resized and converted automatically when you upload them — just upload the normal file. Portrait (4:5) works best for event posters, e.g. the Instagram post.
- In blog posts, put **two images directly below each other** (no empty line between) to show them side by side, as in the Frontier comparison post.
- In the home page headline, wrap words in `*asterisks*` to make them yellow.
- Prices are plain text, so write them exactly as they should appear (`8.99 €`, `+ 1.99 €`, `on request` — in German `8,99 €`, `auf Anfrage`).
- Links to other pages (e.g. `/blog/fuji-frontier/`) can be written the same way in both languages; on the German site they automatically lead to the German page.

You can also edit any file directly on GitHub (pencil icon) — the content lives in [`src/content/`](src/content) and [`src/data/`](src/data). German versions sit next to the English ones: `index.md` (English) and `index.de.md` (German), `site.json` and `site.de.json`.

---

## 🚀 One-time setup

1. **Create a GitHub repository** (e.g. `blix-website`) and push this folder to the `main` branch:
   ```sh
   git init && git add . && git commit -m "New blix website"
   git branch -M main
   git remote add origin git@github.com:<user-or-org>/blix-website.git
   git push -u origin main
   ```
2. In the repository go to **Settings → Pages → Build and deployment → Source: GitHub Actions**.
   The first deploy runs automatically; the site appears at `https://<user-or-org>.github.io/blix-website/`.
3. In [`public/admin/config.yml`](public/admin/config.yml) replace `YOUR-GITHUB-USER/blix-website` with the real repository name.
4. Invite everyone who should edit the site under **Settings → Collaborators** (role *Write*).

**Moving blixmunich.de over (later)**

1. Repository **Settings → Pages → Custom domain**: enter `www.blixmunich.de`, tick *Enforce HTTPS* once available.
2. At the domain registrar, point DNS to GitHub: a `CNAME` record `www → <user-or-org>.github.io` and, for the bare domain, `A` records to `185.199.108.153`, `185.199.109.153`, `185.199.110.153`, `185.199.111.153` ([GitHub docs](https://docs.github.com/en/pages/configuring-a-custom-domain-for-your-github-pages-site)).
3. Nothing else changes — the build picks up the new domain automatically. Old Squarespace URLs (old event and blog links, `/dsgvo`, `/home`) redirect to the new pages.

**Nicer editor login (optional).** Instead of access tokens, editors can use a normal “Sign in with GitHub” button by deploying the free [Sveltia CMS Authenticator](https://github.com/sveltia/sveltia-cms-auth) on Cloudflare Workers and adding its URL as `base_url` under `backend` in `config.yml`.

**Contact form.** GitHub Pages can't send email itself, so the form is delivered by [Web3Forms](https://web3forms.com) (free up to 250 messages a month). Create an access key on their site for the address that should receive the messages, then paste it into *Site settings → Contact form key*. Without a key the contact page shows an Instagram fallback instead of the form. Spam protection: a hidden honeypot field, a minimum fill-in time, and Web3Forms' own filtering. If spam still gets through, Web3Forms' free hCaptcha can be added to the form.

**Email address.** The blix email is deliberately not shown on the site to avoid spam. It only appears where the law requires it (Impressum, Datenschutz), and there it is encoded so bots can't read it from the page source (any email link written in Markdown is protected the same way; see `src/lib/protect-email.mjs`).

---

## 🔌 Data for other tools

The build publishes machine-readable versions of the content, so other software (booking, lab tools, displays, newsletters…) can read it:

| URL | Contents |
| --- | --- |
| `/events.json` | All events with ISO start/end times, location, poster, ticket and page URLs |
| `/events.ics` | Calendar feed — subscribe in Google/Apple Calendar (each event also has `/events/<id>.ics`) |
| `/site.json` | Opening hours, address, links |

Tools can also **write** content: everything is Markdown/JSON in this repository, so a script can commit a new file in `src/content/events/<date>-<name>/index.md` via the GitHub API and the site rebuilds on its own.

---

## 🛠 Development

Requires Node.js 24.

```sh
npm install
npm run dev       # http://localhost:4321  (editor: http://localhost:4321/admin/index.html)
npm run build     # static site in dist/
npm run check     # type-check
```

With the dev server running, the editor offers **Work with Local Repository** (Chrome/Edge), which edits the files on your disk without going through GitHub.

```
src/
  content/           index.md = English, index.de.md = German translation (optional)
    home/            home page text + photo
    pages/<id>/      Lab, Studio, Space (prices, facts, galleries) → /<id>/ and /de/<id>/
    events/<id>/     one folder per event (+ poster) → /events/<id>/
    blog/<id>/       one folder per post (+ images) → /blog/<id>/
    legal/           Impressum, AGB, Datenschutz (German only) → /<file name>/
  data/site.json     global settings (hours, address, links); site.de.json = German texts
  i18n/              languages: config.ts (locales, URLs), ui.ts (fixed interface text in EN/DE),
                     content.ts (lays German over English, falls back to English)
  content.config.ts  content schemas — keep in sync with public/admin/config.yml
  components/        Header, Footer, cards, gallery, film strip, …
  layouts/Base.astro page shell, meta tags, structured data
  lib/               time zone & opening-hours logic, Markdown helpers, calendar feed
  pages/[...lang]/   routes — each builds the English page and the /de/ page
  styles/global.css  design tokens (colours, type) and shared styles
public/admin/        the editor (Sveltia CMS) and its configuration
01_logo/             original logo files — kept locally, not in the repo (the site uses an SVG traced from the yellow PNG)
```

**Design tokens** live at the top of [`src/styles/global.css`](src/styles/global.css): logo yellow `#fec700` on a warm near-black, Archivo (condensed for headings) and JetBrains Mono for film-edge labels. Fonts are self-hosted — no requests to Google.

When you add a field, add it in both [`src/content.config.ts`](src/content.config.ts) and [`public/admin/config.yml`](public/admin/config.yml).
