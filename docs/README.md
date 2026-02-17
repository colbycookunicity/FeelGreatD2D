# KnockBase Documentation

KnockBase is a mobile-first door-to-door sales tracking application. It helps sales teams manage leads, map territories, plan routes, and track performance — all from the field. The app includes multi-user authentication with role-based access control, an interactive map for canvassing, and an integrated product shop powered by Shopify.

---

## Table of Contents

1. [Getting Started](#getting-started)
2. [User Roles & Permissions](#user-roles--permissions)
3. [Authentication](#authentication)
4. [Map View](#map-view)
5. [Lead Management](#lead-management)
6. [Territory Mapping](#territory-mapping)
7. [Route Planning](#route-planning)
8. [Dashboard & Stats](#dashboard--stats)
9. [Shop (Shopify Integration)](#shop-shopify-integration)
10. [Admin Panel / User Management](#admin-panel--user-management)
11. [API Reference](#api-reference)
12. [Technical Architecture](#technical-architecture)

---

## Getting Started

### Default Credentials

When the server starts for the first time, a default admin account is created automatically:

- **Username:** `admin`
- **Password:** `admin123`

Use these credentials to log in and begin setting up your team.

### Accessing the App

KnockBase is designed as a mobile-first application. You can access it in two ways:

- **Mobile (recommended):** Open the app using Expo Go on your iOS or Android device by scanning the QR code from the development server.
- **Web:** Access the app through a browser. Note that map features (interactive pins, territory drawing, long-press to add leads) are only available on mobile — the web version shows a simplified fallback view.

---

## User Roles & Permissions

KnockBase uses a three-tier role hierarchy:

### Admin

- Full access to all features
- Can view all leads across the entire organization
- Can create, edit, and delete users of any role (admin, manager, or sales rep)
- Can assign sales reps to managers
- Access to the Admin Panel from the Dashboard

### Manager

- Can view their own leads plus leads from their team (sales reps assigned to them)
- Can create and manage sales reps under their team
- Cannot create admins or other managers
- Access to a "My Team" panel from the Dashboard

### Sales Rep

- Can only view and manage their own leads
- No access to user management
- Assigned to a manager (optional)

---

## Authentication

KnockBase uses session-based authentication. Sessions are stored server-side in PostgreSQL and persist for up to 30 days.

### Login

Enter your username and password on the login screen. If your account has been deactivated by an admin, you will be unable to log in.

### Logout

Tap the logout icon on the Dashboard screen to end your session.

### Session Behavior

- Sessions persist across app restarts
- The app automatically checks your session status on launch
- If your session expires, you will be returned to the login screen

---

## Map View

The Map View is the primary screen and the first tab you see after logging in. It provides a real-time, interactive map for canvassing.

### GPS Location

On launch, the app requests location permission and centers the map on your current position. A loading indicator is shown while your location is being determined.

### Lead Pins

Each lead appears as a color-coded pin on the map. The pin color corresponds to the lead's current status (e.g., green for Sold, yellow for Not Home).

### Status Filters

A horizontal filter bar at the top of the map lets you filter which leads are visible by status. Tap "All" to show everything, or tap individual status chips to show only leads matching those statuses. Multiple filters can be active at once.

### Lead Preview Card

Tap any lead pin to open a preview card at the bottom of the screen showing the lead's name, address, and status. From this card you can:

- **Navigate between leads** — Use the left/right arrows to cycle through leads. The map automatically pans to each lead.
- **Quick disposition** — Tap the edit button to open the Disposition Sheet and update the lead's status and notes without leaving the map.
- **View full details** — Tap the card itself to open the lead detail screen.

### Adding Leads from the Map

- **Floating action button (+):** Tap the "+" button to create a new lead at your current location.
- **Long-press:** Long-press anywhere on the map to create a new lead at that exact position. The coordinates are automatically passed to the lead form.

### Center on Location

Tap the crosshair button to re-center the map on your current GPS position.

### Territory Overlays

If territories have been created, they appear as colored polygon overlays on the map. Use the layers toggle button to show or hide territory boundaries. Tap the hexagon button to open the Territory Editor.

### Web Fallback

On web, the map is replaced with a simplified list view showing your leads with color-coded status dots. Full map functionality requires the mobile app via Expo Go.

---

## Lead Management

### Creating a Lead

You can create a new lead in several ways:

1. Tap the "+" button on the Map View or Leads List
2. Long-press on the map at a specific location
3. Both methods open the Lead Form

### Lead Form Fields

- **Contact Information:** First name, last name, phone number, email
- **Location:** Street address, plus a "Pick on Map" button that opens a full-screen map where you can tap to select the exact house location. Coordinates are displayed after selection.
- **Status:** Choose from seven status options (see below)
- **Scheduling:** Set an appointment date/time or a follow-up date
- **Tags:** Select from common preset tags (HOA, Renter, Owner, Gated, Dog, Spanish, Senior, New Build) or add custom tags
- **Notes:** Free-text area for additional information

### Lead Statuses

| Status | Description |
|--------|-------------|
| **Untouched** | Lead has not been contacted yet |
| **Not Home** | Nobody answered the door |
| **Not Interested** | Homeowner declined |
| **Callback** | Homeowner requested a callback |
| **Appointment** | Appointment has been scheduled |
| **Sold** | Sale completed |
| **Follow Up** | Requires follow-up action |

Each status has a unique color that appears on map pins, list items, and filter chips throughout the app.

### Editing a Lead

From the Leads List, swipe a lead card to reveal edit and delete actions. Tap edit to reopen the Lead Form with existing data pre-filled.

### Deleting a Lead

Swipe a lead card and tap delete. A confirmation dialog will appear before the lead is permanently removed.

### Leads List

The Leads tab provides a searchable, filterable, sortable list of all your leads:

- **Search:** Filter leads by name, address, or phone number
- **Status filter:** Horizontal chips to show only leads of a specific status, with counts
- **Sort options:** Sort by Recent (most recently updated), Name (alphabetical), or Status (priority order)
- **Lead count:** Displays the total number of matching leads

### Disposition Sheet

The Disposition Sheet is a quick-action overlay available from the Map View's lead preview card. It lets you rapidly update a lead's status and add notes without navigating away from the map — ideal for door-to-door canvassing.

---

## Territory Mapping

Territories let you define geographic boundaries for your sales areas.

### Creating a Territory

1. Tap the hexagon button on the Map View to open the Territory Editor
2. Tap points on the map to draw a polygon boundary
3. Name the territory
4. Choose a color from the available palette (blue, green, yellow, red, purple, cyan, pink, orange)
5. Optionally assign a sales rep to the territory
6. Save to create the territory

### Editing Territories

Open an existing territory to modify its boundaries, name, color, or assigned rep.

### Map Overlays

Territories appear as semi-transparent colored polygons on the Map View. Use the layers toggle button (on the right side of the map) to show or hide all territory overlays.

### Web Limitation

Territory drawing requires the native map component and is only available on mobile via Expo Go. The web version shows a placeholder message.

---

## Route Planning

The Route tab helps you plan your daily canvassing route by organizing leads by proximity.

### How It Works

The app uses your current GPS location and sorts all leads by distance from closest to farthest. Each lead is numbered in order and shows:

- Lead name and address
- Current status badge
- Distance from your location (in feet if under 0.1 miles, otherwise in miles)

### Filters

Filter your route list by:

- **All Leads** — Shows every lead
- **Unvisited** — Shows only leads with "Untouched" status
- **Callbacks** — Shows leads with "Callback" or "Follow Up" status

### Navigation

Tap the navigation arrow on any lead to open turn-by-turn directions in your device's native maps app (Apple Maps on iOS, Google Maps on Android, or Google Maps in the browser on web).

### Lead Details

Tap any lead in the route list to view its full details.

---

## Dashboard & Stats

The Dashboard provides an overview of your sales performance.

### Period Filtering

Toggle between three time periods to view your stats:

- **Today** — Activity from the current day
- **This Week** — Activity from the current week
- **All Time** — Cumulative totals

### Key Metrics

- **Doors Knocked** — Number of leads with a recorded knock
- **Contacts** — Leads where contact was made (callback, appointment, sold, follow-up, not interested)
- **Appointments** — Leads with appointment status
- **Sales** — Leads with sold status

### Conversion Rates

- **Contact Rate** — Percentage of doors knocked that resulted in contact
- **Close Rate** — Percentage of contacts that converted to sales

### Pipeline

A visual breakdown of all leads by status, showing a bar chart with counts for each status category.

### Upcoming Activity

- **Upcoming Appointments** — Next 5 scheduled appointments with dates
- **Pending Callbacks** — Next 5 pending callbacks with follow-up dates

### Quick Actions

- **Total leads badge** — Tap to navigate to the Leads List
- **Team management** — Admins and managers see a people icon to access the Admin Panel
- **Logout** — Tap the logout icon to sign out

---

## Shop (Shopify Integration)

The Shop tab connects to a Shopify store via the Storefront API, letting your sales team browse and sell products directly from the app.

### Product Catalog

Products are displayed in a two-column grid showing:

- Product image
- Vendor name
- Product title
- Price (or price range if multiple variants exist)
- "Sold out" badge for unavailable items

Pull down to refresh the product list.

### Search

Use the search bar at the top of the Shop tab to find products by keyword. Search queries are sent to the Shopify Storefront API.

### Product Detail

Tap any product to view its full details:

- **Image gallery** — Browse through product images with thumbnail navigation
- **Pricing** — Current price with compare-at price (strikethrough) for sale items
- **Tags** — Product tags displayed as chips
- **Variant selection** — Choose from available options (size, color, etc.). Unavailable variants are dimmed.
- **Description** — Full product description

### Checkout

1. Select a product variant
2. Adjust the quantity using the +/- buttons
3. Tap "Buy Now" to create a Shopify cart
4. You'll be redirected to Shopify's hosted checkout page to complete the purchase

### Configuration

The Shopify integration requires two environment variables:

- `SHOPIFY_STORE_DOMAIN` — Your Shopify store domain (e.g., `your-store.myshopify.com`)
- `SHOPIFY_STOREFRONT_ACCESS_TOKEN` — A Storefront API access token from your Shopify admin

---

## Admin Panel / User Management

Accessible from the Dashboard by admins and managers.

### User List

Users are displayed in a grouped layout:

- **Admins** see users organized by role: Admins, Managers, Sales Reps
- **Managers** see only their own team members

Each user card shows:

- Role icon with color coding (purple for Admin, blue for Manager, green for Sales Rep)
- Full name and username
- Role label
- Manager assignment (for sales reps)
- Active/inactive status toggle
- Delete button

Your own account is marked with a "You" badge and cannot be deactivated or deleted.

### Creating a User

Tap the add user icon to open the creation form:

- **Username** (required, must be unique)
- **Full Name** (required)
- **Email** and **Phone** (optional)
- **Password** (required for new users)
- **Role** — Admins can assign any role; managers can only create sales reps
- **Manager Assignment** — When creating a sales rep, admins can assign them to a manager. Managers automatically assign new reps to themselves.

### Editing a User

Tap any user card to edit their details. All fields can be updated. Leave the password field blank to keep the existing password.

### Toggling Active Status

Tap the checkmark/X icon on a user card to activate or deactivate their account. Deactivated users cannot log in.

### Deleting a User

Tap the trash icon and confirm to permanently delete a user account.

### Permission Boundaries

- Managers can only edit or delete sales reps on their own team
- Managers cannot change a rep's role to anything other than sales rep
- Admins have unrestricted access to all user management functions

---

## API Reference

All API endpoints are served from the Express backend on port 5000. Endpoints require authentication unless otherwise noted.

### Authentication

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| `POST` | `/api/auth/login` | Log in with username and password | No |
| `POST` | `/api/auth/logout` | End the current session | No |
| `GET` | `/api/auth/me` | Get the currently authenticated user | Yes |

### Users

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| `GET` | `/api/users` | List users visible to the current user | Admin or Manager |
| `POST` | `/api/users` | Create a new user | Admin or Manager |
| `PUT` | `/api/users/:id` | Update a user | Admin or Manager |
| `DELETE` | `/api/users/:id` | Delete a user | Admin or Manager |

### Leads

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| `GET` | `/api/leads` | Get leads visible to the current user (role-filtered) | Yes |
| `POST` | `/api/leads` | Create a new lead | Yes |
| `PUT` | `/api/leads/:id` | Update a lead | Yes |
| `DELETE` | `/api/leads/:id` | Delete a lead | Yes |

### Territories

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| `GET` | `/api/territories` | List all territories | Yes |
| `POST` | `/api/territories` | Create a new territory | Yes |
| `PUT` | `/api/territories/:id` | Update a territory | Yes |
| `DELETE` | `/api/territories/:id` | Delete a territory | Yes |

### Shopify

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| `GET` | `/api/shopify/products` | List products (supports `first` and `after` query params for pagination) | Yes |
| `GET` | `/api/shopify/products/:id` | Get a single product by ID | Yes |
| `GET` | `/api/shopify/search?q=term` | Search products by keyword | Yes |
| `POST` | `/api/shopify/checkout` | Create a Shopify cart and get a checkout URL | Yes |
| `GET` | `/api/shopify/shop` | Get shop name and description | Yes |

---

## Technical Architecture

### Frontend

- **Framework:** React Native with Expo
- **Routing:** Expo Router (file-based routing)
- **State Management:** React Context for shared state (auth, leads, territories), React Query for server data fetching
- **Styling:** React Native StyleSheet with Inter font family
- **Maps:** react-native-maps v1.18.0 (Expo Go compatible)
- **Theme:** Dark/light mode support with emerald green (#10B981) primary accent

### Backend

- **Runtime:** Node.js with Express
- **Language:** TypeScript
- **Port:** 5000
- **Session Store:** PostgreSQL-backed sessions via connect-pg-simple (30-day expiry)
- **Password Hashing:** bcrypt

### Database

- **Engine:** PostgreSQL
- **ORM:** Drizzle ORM
- **Tables:**
  - `users` — User accounts with roles and manager relationships
  - `leads` — Sales leads with location, status, tags, and scheduling
  - `territories` — Named polygon boundaries with color and rep assignment
  - `user_sessions` — Server-side session storage

### Platform Patterns

KnockBase uses platform-specific components to handle differences between mobile and web:

- **Map components** (`NativeMap.tsx` / `NativeMap.web.tsx`) — Native maps on mobile, fallback UI on web
- **Map picker** (`MapPickerNative.tsx` / `MapPickerNative.web.tsx`) — Tap-to-select location on mobile, fallback on web
- **Territory editor** (`TerritoryEditorNative.tsx` / `TerritoryEditorNative.web.tsx`) — Polygon drawing on mobile, fallback on web

The `.web.tsx` file extension convention allows Expo/React Native to automatically load the correct component for each platform.
