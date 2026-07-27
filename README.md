# Birchwood Village Apartments — website

Static marketing site for Birchwood Village Apartments, 3615–3618 E Uintah St., Colorado Springs, CO 80909.
Hosted free on GitHub Pages at **https://www.rentbirchwoodvillage.com**.

Replaces the previous WordPress/Divi site that ran on Bluehost.

---

## What's here

```
index.html              Single-page site (all sections)
404.html                Not-found page
CNAME                   Custom domain for GitHub Pages
.nojekyll               Serve files as-is, no Jekyll processing
robots.txt              Search engine directives
sitemap.xml             Sitemap
assets/
  css/styles.css        All styles
  js/main.js            Nav, gallery filter, lightbox, scroll effects
  img/                  Logo, favicon, hero, social preview
  img/gallery/          20 optimized property photos
```

No build step, no dependencies, no framework. Edit the files and push.

---

## Before launch — two things to confirm

### 1. The email address on the "Email the office" button

The old site's contact form never exposed an email address, so the button currently points at:

```
leasing@rentbirchwoodvillage.com
```

**Confirm this mailbox exists (or swap in the real one).** It appears once, in `index.html`,
in the `mailto:` link inside the contact section — search for `leasing@`.

### 2. Email hosting, if it lives at Bluehost

If any `@rentbirchwoodvillage.com` email is currently hosted **by Bluehost**, cancelling that
hosting plan will kill the email along with the website. GitHub Pages serves web only — it does
not host mail. Move email to another provider (Google Workspace, Fastmail, Zoho, etc.) *before*
cancelling, and keep the MX records pointed there.

---

## DNS setup (GoDaddy)

The domain's nameservers are at GoDaddy (`ns75/ns76.domaincontrol.com`). In
**GoDaddy → My Products → Domains → rentbirchwoodvillage.com → DNS**, make the records match:

| Type  | Name | Value                   |
|-------|------|-------------------------|
| A     | @    | `185.199.108.153`       |
| A     | @    | `185.199.109.153`       |
| A     | @    | `185.199.110.153`       |
| A     | @    | `185.199.111.153`       |
| CNAME | www  | `MTHuffness.github.io`  |

Delete the old A record pointing at `162.241.224.59` (Bluehost) and any conflicting
`www` record. **Leave MX records alone** — those route email.

DNS changes take anywhere from a few minutes to a few hours to propagate. Once they have:

1. Go to the repo → **Settings → Pages**
2. Custom domain should read `www.rentbirchwoodvillage.com` with a green check
3. Tick **Enforce HTTPS** (available once GitHub finishes issuing the certificate — can take up to ~24h)

Only cancel Bluehost once the new site is confirmed live and email has been handled.

---

## Editing common things

**Phone number** — appears in several places in `index.html`. Search for `596-2156`
(both the display text and the `tel:+17195962156` links) and the JSON-LD block in `<head>`.

**Office hours** — the `<dl class="hours">` block in the contact section, and the
`openingHoursSpecification` in the JSON-LD block for search engines. Update both.

**Amenities** — the two `<ul class="check-list">` blocks in the amenities section.

**Pet / parking details** — the `<dl class="spec">` blocks in the policies section.

**Pricing link** — the apartments.com URL, used by the two "Check pricing & availability"
and "See current listings" links.

### Adding gallery photos

1. Drop the optimized image in `assets/img/gallery/`
2. Copy an existing `<button class="shot">` block in the gallery section and update
   `data-full`, `data-caption`, `src`, `alt`, `width`, `height`
3. Set `data-cat` to `exterior`, `amenities`, or `interiors` so the filter buttons work

Keep photos under ~1600px on the long edge. To optimize on macOS:

```sh
sips -Z 1600 photo.jpg                              # resize (won't upscale smaller images)
sips -s format jpeg -s formatOptions normal photo.jpg   # recompress
```

---

## Local preview

```sh
cd path/to/this/repo
python3 -m http.server 8000
```

Then open http://localhost:8000.

---

## Notes

- Photos came from the old WordPress media library. Most are 480×640 or 640×480, which is why
  the design keeps images in contained cards rather than full-bleed backgrounds — they'd look
  soft stretched edge to edge. If the property is ever rephotographed, higher-resolution images
  would allow a bolder layout.
- The site is a single page; the nav links are in-page anchors.
- Fonts (Playfair Display, Inter) load from Google Fonts, with system serif/sans fallbacks.
