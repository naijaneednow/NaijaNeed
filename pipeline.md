NaijaNeed — Full Product Spec

"Tell us what you need." — Next.js · Mobile-first · Simple for anyone

Next.js
Light + Dark
English · Pidgin · Hausa
Mobile optimised
Free hosting
Global config variables — editable from admin, no code needed

PLATFORM_NAME
PLATFORM_TAGLINE
HERO_MESSAGE
WEEKLY_LIMIT
ACTIVE_LANGUAGES
CATEGORIES_LIST
MAP_VISIBLE
User journey — first visit

Homepage
→
Click "Tell us what you need"
→
Fill one form
→
Auto-registered + logged in
→
See dashboard
User journey — returning visit

Homepage
→
Recognised by device
→
Name + phone pre-filled
→
Write new need (if week passed)
→
See My Needs updates
User-facing pages

Homepage

Name, tagline, one big CTA. Language toggle top right. Nothing else. Works on any phone.

Submit a need

Name · Phone · Email · State · LGA · Area · Category · Write your need. One page, no steps. Submits and auto-registers.

Dashboard

Nigeria map with dots showing need density by region. Aggregated only — no individual names. Read-only.

My Needs

All user's submissions. Status badge: Submitted · Assigned · In Progress · Fulfilled. Admin comments visible here.

Weekly lock screen

If already submitted this week: "You've shared your need. Come back [day]. We're working on it."

Language toggle

English · Pidgin · Hausa. All UI text translates instantly. Add more languages from config — no rebuild needed.

Admin panel pages

Needs list

Full table. Filter by status, state, LGA, category, date. Search by keyword. Assign in one click.

Need detail

Full submission. Assign to partner. Add notes. Update status. Send comment user will see on My Needs.

Partners directory

Add NGOs, govt bodies, individuals. Name · type · focus area · state coverage · contact.

Users list

All registered users. State, LGA, submission count, last active. No sensitive data to non-super-admins.

Analytics

Total submissions. Top categories. Top states. Resolution rate. Trend charts. CSV export for NGO reports.

Config panel

Edit name, tagline, hero message, categories, languages, weekly limit. Live on save. No developer needed.

Tech stack

Frontend — Next.js

SSR for SEO. Google indexes every page. Fast on mobile. Deploy free on Vercel.

Database — Supabase (free tier)

Postgres + auth + API. Handles permanent login via device token. Free until scale.

Map — Leaflet.js

Free, open source Nigeria map. Dot density overlay. No API cost.

SMS — Termii

Nigerian gateway. OTP on first visit. Status update notifications. Pay as you go.

Hosting — Vercel (free)

Perfect for Next.js. Free tier handles thousands of visitors. Upgrade when needed.

i18n — next-intl

English, Pidgin, Hausa translation files. Swap languages from config instantly.

Build phases

Phase 1 — Weeks 1–6
Core MVP

Get the first real submission live

Homepage

Name, tagline, CTA, language toggle

Submit form

Full form, auto-register, weekly lock

My Needs page

Status tracking per user

Admin needs list

View, filter, assign submissions

Partners list

Add and manage NGOs and govt

Config panel

Name, tagline, categories editable

Phase 2 — Weeks 7–14
Map + Languages + SMS

Make it feel alive and reach more Nigerians

Nigeria map

Dot density on user dashboard

Pidgin + Hausa

Full UI via next-intl

SMS notifications

Status updates to user's phone

Admin analytics

Charts, trends, CSV export

Partner comments

Partners update status on needs

Dark mode

Toggle in header, saved to device

Phase 3 — Months 4–9
Scale + Revenue

NGO portal, paid reports, mobile app

NGO partner portal

Partners log in, see assigned needs

Paid data reports

Monthly PDF reports for NGOs

Android app

React Native wrap of web app

SMS submission

Submit a need via shortcode

Igbo language

4th language added from config

Govt dashboard

Paid state-level view for govt

Year 1 targets

50K+

Registered users

20+

NGO / govt partners

30%

Needs resolved

The config panel means you never need a developer to change the name, tagline, categories, or languages. The admin panel is your full operations centre. A non-technical person can run this day to day.
