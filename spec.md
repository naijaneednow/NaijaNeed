


NaijaNeed
"Tell us what you need."
Full Product Specification & Technical Roadmap
Version 1.0  ·  Confidential


Platform	NaijaNeed
Tagline	"Tell us what you need."
Tech Stack	Next.js · Express.js · Supabase · React Query · Axios
Channels	Web · SMS · Mobile App (Phase 3)
Languages	English · Pidgin · Hausa (more via config)
Hosting	Vercel (free) + Supabase (free tier)
Status	Pre-development — Spec v1.0
 
1. Platform Overview
NaijaNeed is a civic needs platform that allows any Nigerian to submit their most pressing personal or community need once per week. The platform aggregates these needs and routes them to the most appropriate solution — whether that is a software product, an NGO, a government body, or a community partner.

Unlike protest or accountability platforms, NaijaNeed is warm and solution-oriented. A user might submit: "I need a mentor", "our community needs water", "I need help with school fees", or "I am looking for a job." The platform receives it, categorises it, and connects it to whoever can help.

MISSION
To ensure that every Nigerian — regardless of location, education level, or digital access — has a simple, trusted channel to express what they need, and to connect those needs to people and organisations that can solve them.

CORE PRINCIPLES
•	Warm, not confrontational — this is not a complaints platform against government
•	Simple enough for a grandmother in Borno and a student in Lagos
•	One need per week per user — quality over quantity
•	Privacy first — aggregated data only shown publicly, never individual submissions
•	Config-driven — name, tagline, categories and languages changeable without code

 
2. User Flows
2.1 First Visit — New User
Step	Action
Step 1	User lands on homepage — sees platform name, tagline, and one large CTA button
Step 2	User clicks "Tell us what you need"
Step 3	User fills one form: name, phone, email, state, LGA, area, category, and their need
Step 4	Backend checks if phone number exists — if new, creates account automatically
Step 5	Device token set as HTTP-only cookie — user is permanently logged in
Step 6	User sees confirmation screen and is taken to their dashboard

2.2 Returning Visit — Existing User
Step	Action
Step 1	User lands on homepage
Step 2	Next.js calls GET /auth/me — Express reads cookie and returns user profile
Step 3	Name and phone are pre-filled on the form automatically
Step 4	If user has already submitted this week — weekly lock screen is shown with next available date
Step 5	If week has passed — user writes new need and submits
Step 6	User can check My Needs page for status updates and admin comments

2.3 Weekly Lock Logic
// Express.js — weekly submission check
const startOfWeek = getMonday(new Date());
const existing = await db.needs.findOne({
  userId: user.id,
  createdAt: { gte: startOfWeek }
});
if (existing) {
  return res.status(403).json({
    locked: true,
    message: 'You have already shared your need this week.',
    nextDate: nextMonday()
  });
}

 
3. User-Facing Pages
3.1 Homepage
•	Platform name and tagline (loaded from config variables — see Section 7)
•	One large CTA button: "Tell us what you need"
•	Language selector top right: English, Pidgin, Hausa
•	Dark/light mode toggle in header
•	No other content — clean and unintimidating for first-time users

3.2 Submit a Need (Form)
•	Single page — no multi-step wizard
•	Fields: Full name · Phone number · Email · State · LGA · Area · Category (dropdown) · Write your need (textarea)
•	Category dropdown populated from CATEGORIES_LIST config variable
•	Form submits to POST /needs on the Express backend
•	On success — user is auto-registered, cookie set, redirected to dashboard
•	Returning users — name, phone, email pre-filled. Only need to fill category and their need

3.3 Dashboard
•	Nigeria map (Leaflet.js) showing aggregated need density as dots by state and LGA
•	Dot size represents volume of needs in that area
•	No individual names or details visible — privacy protected
•	Map is read-only — users cannot click or drill into individual submissions
•	MAP_VISIBLE config variable can toggle the map off if needed

3.4 My Needs
•	List of all needs the logged-in user has submitted
•	Each need shows: category, date submitted, current status badge, admin/partner comments
•	Status badges: Submitted · Assigned · In Progress · Fulfilled
•	No logout button — users are permanently logged in via device cookie
•	Weekly lock message shown if user has submitted this week

 
4. Admin Panel
4.1 Needs List
•	Full table of all submitted needs across Nigeria
•	Filters: status (unassigned, assigned, in progress, completed) · state · LGA · category · date range
•	Keyword search across need content
•	One-click assign to partner from the list view
•	Bulk actions: assign multiple, mark as reviewed, export to CSV

4.2 Need Detail View
•	Full submission details
•	Assign to NGO, government body, or individual from the partners directory
•	Add internal admin notes (not visible to user)
•	Send a comment to the user — appears on their My Needs page
•	Update status manually

4.3 Partners Directory
•	Add and manage NGOs, government bodies, and individuals
•	Partner fields: name · type · focus area(s) · states covered · contact person · contact email/phone
•	Filter partners by type and state when assigning needs

4.4 Users List
•	All registered users: name, state, LGA, submission count, last active date
•	Super-admin only: view full contact details
•	Standard admin: sees name, state, LGA, activity — no phone or email

4.5 Analytics Dashboard
•	Total submissions this week, this month, all time
•	Top 5 categories nationally
•	Top 5 states by volume
•	Resolution rate (fulfilled / total)
•	Trend chart — submissions over time
•	Export all data as CSV for NGO reporting and grant applications

4.6 Config Panel
The config panel allows non-technical staff to update key platform settings without any code deployment. All variables below are editable from this panel and take effect immediately.

Variable	Description
PLATFORM_NAME	The platform name displayed across all pages. Default: NaijaNeed
PLATFORM_TAGLINE	The tagline below the name. Default: Tell us what you need.
HERO_MESSAGE	Extended message on the homepage below the CTA button
WEEKLY_LIMIT	Number of submissions allowed per user per week. Default: 1
ACTIVE_LANGUAGES	Comma-separated list of enabled languages. Default: en, pcm, ha
CATEGORIES_LIST	Comma-separated list of need categories shown in the dropdown
MAP_VISIBLE	Toggle the Nigeria map on the user dashboard. Default: true
SUPPORT_EMAIL	Contact email shown in the footer and error messages

 
5. Authentication Architecture
5.1 Approach
Authentication is phone-number based. There are no passwords. The device is the key — a permanent HTTP-only cookie is set on first submission and used to identify the user on all subsequent visits. This approach was chosen to reduce friction for low-tech users who may struggle to remember passwords.

Concern	Solution
User auth	Phone number + HTTP-only cookie (permanent device token)
Admin auth	Email + password + JWT Bearer token
First visit	Auto-register on form submission — no separate signup step
Returning visit	Cookie read server-side by Express — user identified silently
Logout	No logout button for users — session is permanent by design
OTP verification	Phase 2 — added via Termii SMS gateway once SMS is integrated

5.2 Express.js Auth Endpoints
Endpoint	Description
POST /auth/register	Create user record, set HTTP-only device cookie, return user profile
GET /auth/me	Read cookie, return current user — called by Next.js on every page load
POST /needs	Submit a need (checks weekly lock before saving)
GET /needs/mine	Return all needs for the authenticated user
GET /admin/needs	Admin — paginated list with filters
PATCH /admin/needs/:id	Admin — update status, assign partner, add comment
GET /admin/partners	Admin — list all partners
POST /admin/partners	Admin — create new partner
POST /admin/auth/login	Admin login — returns JWT

5.3 Cookie Strategy
// Express — setting the permanent device cookie on registration
res.cookie('nn_device', deviceToken, {
  httpOnly: true,      // Cannot be accessed by JavaScript
  secure: true,        // HTTPS only
  sameSite: 'lax',     // CSRF protection
  maxAge: 365 * 24 * 60 * 60 * 1000  // 1 year
});

// Express — reading the cookie on GET /auth/me
const token = req.cookies.nn_device;
const user = await db.users.findOne({ deviceToken: token });
if (!user) return res.status(401).json({ error: 'Not authenticated' });
return res.json(user);

 
6. Frontend Data Fetching — React Query + Axios
6.1 Why This Combination
The frontend uses React Query (TanStack Query) as the data layer paired with Axios as the HTTP client. This combination was chosen specifically for the Nigerian mobile user context.

Feature	Why it matters for NaijaNeed
Automatic caching	My Needs page does not re-fetch on every navigation. Feels fast on slow 3G networks
Stale-while-revalidate	Shows cached data instantly, updates silently in background — critical for low-data users
Built-in loading/error states	Less boilerplate — loading spinners and error messages handled automatically
Mutation handling	Submitting a need, updating status — optimistic updates built in
withCredentials support	Axios automatically attaches the HTTP-only cookie on every request
Next.js compatible	No conflicts — well documented, large community support

6.2 Axios Instance (Centralised API Client)
// lib/api.js — single Axios instance used everywhere in the app
import axios from 'axios';

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL, // e.g. https://api.naijaneed.ng
  withCredentials: true,  // sends HTTP-only cookie automatically on every request
  headers: { 'Content-Type': 'application/json' }
});

// Response interceptor — handle 401 globally
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // User not authenticated — redirect to homepage
      window.location.href = '/';
    }
    return Promise.reject(error);
  }
);

export default api;

6.3 React Query Hooks
// hooks/useCurrentUser.js
import { useQuery } from '@tanstack/react-query';
import api from '@/lib/api';

export const useCurrentUser = () => {
  return useQuery({
    queryKey: ['currentUser'],
    queryFn: () => api.get('/auth/me').then(r => r.data),
    staleTime: 1000 * 60 * 5,  // cache for 5 minutes
    retry: false,              // don't retry if not logged in
  });
};

// hooks/useMyNeeds.js
export const useMyNeeds = () => {
  return useQuery({
    queryKey: ['myNeeds'],
    queryFn: () => api.get('/needs/mine').then(r => r.data),
    staleTime: 1000 * 60 * 2,  // refresh every 2 minutes
  });
};

// hooks/useSubmitNeed.js
import { useMutation, useQueryClient } from '@tanstack/react-query';

export const useSubmitNeed = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data) => api.post('/needs', data).then(r => r.data),
    onSuccess: () => {
      // Automatically refreshes My Needs page after submission
      queryClient.invalidateQueries({ queryKey: ['myNeeds'] });
      queryClient.invalidateQueries({ queryKey: ['currentUser'] });
    },
  });
};

6.4 Usage in a Next.js Page
// app/dashboard/page.jsx
import { useCurrentUser } from '@/hooks/useCurrentUser';
import { useMyNeeds } from '@/hooks/useMyNeeds';

export default function Dashboard() {
  const { data: user, isLoading } = useCurrentUser();
  const { data: needs } = useMyNeeds();

  if (isLoading) return <LoadingSpinner />;
  if (!user) return <redirect to='/' />;

  return (
    <div>
      <h1>Welcome, {user.name}</h1>
      <NigeriaMap />
      <NeedsList needs={needs} />
    </div>
  );
}

6.5 React Query Provider Setup
// app/layout.jsx — wrap the entire app once
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60,  // 1 minute global default
      gcTime: 1000 * 60 * 10, // keep cache for 10 minutes
      refetchOnWindowFocus: false, // avoid unnecessary refetches on mobile
    }
  }
});

export default function RootLayout({ children }) {
  return (
    <QueryClientProvider client={queryClient}>
      {children}
    </QueryClientProvider>
  );
}

 
7. Tech Stack
Technology	Role	Reason
Next.js	Frontend framework	SSR for SEO. Google indexes every page. Deploy free on Vercel
Express.js	Backend API	Full control over auth, routing, weekly lock logic, admin APIs
Supabase	Database + Auth	Postgres database. Free tier handles Phase 1 and 2. Easy to scale
React Query	Data fetching layer	Caching, background sync, mutation handling — fast on slow networks
Axios	HTTP client	Paired with React Query. withCredentials sends cookie automatically
Leaflet.js	Nigeria map	Free, open source. Dot density overlay. No API cost
next-intl	Internationalisation	English, Pidgin, Hausa. Add languages from config — no rebuild
Termii	SMS gateway	Nigerian provider. OTP + status notifications. Pay as you go
Vercel	Frontend hosting	Free tier. Perfect for Next.js. Scales automatically
Tailwind CSS	Styling	Utility-first. Fast to build. Consistent on mobile

 
8. Build Phases & Roadmap
Phase 1 — Weeks 1 to 6: Core MVP
Goal: Get the first real submission live end to end.

Homepage
Platform name, tagline, CTA, language toggle	Admin needs list
View, filter, assign submissions
Submit form
Full form, auto-register, weekly lock enforced	Partners directory
Add and manage NGOs and govt bodies
My Needs page
Submission list with status badges	Config panel
Name, tagline, categories editable without code

Phase 2 — Weeks 7 to 14: Map, Languages, SMS
Goal: Make it feel alive and reach more Nigerians.

Nigeria map
Dot density overlay on user dashboard	Admin analytics
Charts, trends, CSV export
Pidgin + Hausa
Full UI translation via next-intl	Partner comments
Assigned partners can update need status
SMS notifications
Status updates sent to user phone via Termii	Dark mode
Toggle in header, saved to device preference

Phase 3 — Months 4 to 9: Scale and Revenue
Goal: NGO portal, paid reports, mobile app, deeper reach.

NGO partner portal
Partners log in to see their assigned needs	SMS submission
Submit a need via SMS shortcode
Paid data reports
Monthly PDF reports for NGOs by state	Igbo language
4th language added via config panel
Android app
React Native wrap of the web app	Govt dashboard
Paid state-level view for government bodies

 
9. Revenue Model
Tier 1 — Months 1 to 6 (Start Here)
Stream	Description
Software SaaS	When a submitted need has a software solution, build it and charge users. Starting price: NGN 3,000 per year. Low price means high volume potential.
NGO data reports	Sell anonymised, aggregated monthly reports to NGOs by state and category. NGN 50,000 to 200,000 per month per NGO. Easy to produce from existing data.
NGO routing access	Charge NGOs a monthly fee to receive pre-qualified needs in their focus area. They save weeks of field research. NGN 100,000 per month per NGO.

Tier 2 — Months 6 to 18 (After Credibility is Established)
Stream	Description
Government contracts	Sell state-level dashboards to LGAs and state ministries. NGN 5,000,000 per year per state. One contract funds significant runway.
Media access	Sell trend data and early alerts to media houses (Punch, Channels TV, TheCable). NGN 50,000 to 150,000 per month.
Corporate CSR	Match corporations (MTN, Dangote, Zenith Bank) to communities with needs. Charge for the research and routing service.

NOTE: Only aggregated, anonymised data is sold — never individual submissions, contact details,
or personally identifiable information. Selling insights about patterns is a legitimate research
service. It is not the same as selling people's data. This distinction must be maintained at all times.

 
10. Year 1 Success Targets
Metric	Target	Note
Registered users	50,000+	Driven by SMS outreach and word of mouth
Active NGO/govt partners	20+	At least 2 per geopolitical zone
Needs resolved or responded to	30%	Response rate, not full resolution
Revenue (end of year 1)	NGN 2M+	Combination of reports and routing fees
States represented	30+	Coverage across Nigeria
Languages supported	3	English, Pidgin, Hausa at launch

 
11. Important Design Decisions
No logout button
Users are permanently logged in via device cookie. This removes a major friction point for low-tech users who may not remember passwords or usernames. The trade-off is that shared devices could expose one person's needs to another. This is acceptable for Phase 1 — Phase 2 can add an optional PIN for users who want it.

Phone number as identity
Phone number is the unique identifier per user, not email. Every Nigerian has a phone number. Not everyone has an email address they can remember. Phone number also enables SMS notifications in Phase 2 without requiring additional data collection.

One need per week
The weekly limit is the most important product decision. It forces users to submit their single most important need rather than spamming the platform. This produces higher quality data, makes admin review manageable, and gives every submission more weight. The WEEKLY_LIMIT variable allows this to be adjusted from the config panel without a code change.

Config-driven everything
The platform name, tagline, hero message, categories, languages, and weekly limit are all stored as config variables editable from the admin panel. This means the platform can be rebranded, re-focused, or localised without any developer involvement. This is critical for a small team.

Free hosting in Phase 1
Vercel (frontend) and Supabase free tier (database) mean Phase 1 infrastructure cost is zero outside the domain registration. This allows the team to prove the concept and gather real user feedback before committing to paid infrastructure.

