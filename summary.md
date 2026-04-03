# NaijaNeed Application Summary

NaijaNeed is a civic technology platform designed to bridge the gap between Nigerian citizens and solution providers (government, NGOs, private partners). It allows citizens to voice their community needs—ranging from healthcare and education to infrastructure and security—ensuring these needs are documented, categorized, and channeled to the right quarters.

## Core Features
- **Multi-Language Support**: Full support for English, Harshen Hausa, Èdè Yorùbá, Asụsụ Igbo, and Nigerian Pidgin to ensure accessibility for all Nigerians.
- **Geospatial Targeting**: Needs are linked to specific States and Local Government Areas (LGAs) for precise reporting.
- **Real-time Notifications**: Citizens receive SMS updates when the status of their submitted need changes.
- **Premium UI/UX**: A modern, responsive interface with dark mode support and interactive components.

---

## User Roles & Responsibilities

### 1. Citizen (General User)
The primary user of the platform. Their journey is designed to be frictionless, focusing on ease of submission.
- **Submission**: Can submit "Needs" by selecting a category (e.g., Water, Power, Roads) and providing a description.
- **Auto-Registration**: Users are automatically registered or logged in via their phone number during their first submission.
- **History Tracking**: Can view a personal dashboard showing the status of all their previously submitted needs.
- **Anonymity & Privacy**: Submissions can be shared with partners in an anonymized format to protect user identity while seeking solutions.
- **Limits**: Subject to a weekly submission limit (configurable) to prevent spam.

### 2. Admin
Responsible for the day-to-day management of submissions and partner coordination.
- **Submission Management**: View, filter, and search through all citizen submissions across the country.
- **Status Updates**: Update the progress of a need (e.g., "Submitted" → "In Review" → "In Progress" → "Resolved").
- **Notes & Comments**: Add internal admin notes for record-keeping or public comments for the user's benefit.
- **Partner Assignment**: Assign specific needs to registered partners (NGOs or contractors) who can provide solutions.
- **Analytics**: Access high-level data on submission trends, growth, and category distributions.
- **Reporting**: Export detailed CSV reports of all needs for offline analysis or stakeholders.

### 3. SuperAdmin
The highest level of authority, managing both the system configuration and the administrative team.
- **System Configuration**: Manage global settings via the `config` table, including:
    - `WEEKLY_LIMIT`: How many needs a citizen can submit per week.
    - `MAP_VISIBLE`: Control the visibility of geospatial data.
    - `PLATFORM_NAME` & `TAGLINE`: Update branding dynamically.
- **Admin Management**: Create, update, and manage other Admin accounts.
- **Data Access**: Unlike regular Admins, SuperAdmins have access to sensitive user data (Phone numbers and Emails) for audit and verification purposes.
- **Advanced Monitoring**: Full visibility into system logs and database health.

---

## Technical Stack
- **Frontend**: Next.js (App Router), Tailwind CSS, Framer Motion, Lucide Icons.
- **Backend**: Node.js/Express, PostgreSQL.
- **Localization**: next-intl for multi-language management.
- **External Intgrations**: Axios for API calls, SMS Gateway for notifications.
