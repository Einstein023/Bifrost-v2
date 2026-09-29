# Bifrost

Bifrost is an event networking workspace intended to make it easier for attendees to introduce themselves and exchange contact details at in-person events. The repository is a JavaScript/TypeScript monorepo containing an attendee web app, an organizer app placeholder, and shared TypeScript contracts.

> **Project status:** early development. The attendee app currently supports anonymous Firebase sign-in, attendee profile editing, QR badge display, and QR badge scanning. The organizer app is not implemented yet. Features such as event management, proximity discovery, analytics, contact persistence, offline support, and a production PWA are planned concepts, not currently delivered functionality.

## Contents

- [Repository layout](#repository-layout)
- [Technology](#technology)
- [Requirements](#requirements)
- [Getting started](#getting-started)
- [Firebase configuration](#firebase-configuration)
- [Running and building the apps](#running-and-building-the-apps)
- [Current attendee workflows](#current-attendee-workflows)
- [Data and QR format](#data-and-qr-format)
- [Shared types](#shared-types)
- [Development notes](#development-notes)
- [Roadmap](#roadmap)
- [Troubleshooting](#troubleshooting)

## Repository layout

```text
.
├── apps/
│   ├── attendee/             # Attendee-facing React app
│   │   ├── src/components/   # Profile form, QR badge, and scanner
│   │   ├── firebase.js       # Firebase app, auth, Firestore, and RTDB setup
│   │   └── vite.config.ts
│   └── organizer/            # Organizer app scaffold (not implemented)
├── packages/
│   └── shared-types/         # Shared event, attendee, and connection types
├── .env.example              # Firebase environment-variable template
├── package.json              # npm workspaces and root scripts
└── package-lock.json         # npm workspace lockfile
```

## Technology

- **Workspace/package manager:** npm workspaces
- **Frontend:** React 19 with Vite 8
- **Attendee language:** JSX components with a TypeScript entry point and TypeScript project checks
- **Styling:** Tailwind CSS v4 through the Vite plugin
- **Icons:** Lucide React
- **QR codes:** `qrcode.react` for badge generation and `html5-qrcode` for scanning
- **Backend currently used by the attendee app:** Firebase Authentication, Cloud Firestore, Realtime Database initialization, and Firebase Analytics initialization
- **Linting:** Oxlint
- **Shared contracts:** TypeScript interfaces in `packages/shared-types`

The repository has an npm lockfile. Use npm commands from the repository root so workspace dependency resolution stays consistent.

## Requirements

- Node.js 20 or newer
- npm (the npm version bundled with a current Node.js LTS installation is recommended)
- A Firebase project for attendee authentication and profile storage
- A modern browser; camera access for QR scanning requires a secure context such as `localhost` or HTTPS and user permission

## Getting started

From the repository root:

```bash
npm install
```

Configure Firebase as described in [Firebase configuration](#firebase-configuration), then start the attendee app:

```bash
npm run dev:attendee
```

Vite prints the local URL when the development server starts. To start the organizer scaffold instead:

```bash
npm run dev:organizer
```

Both apps are independent Vite workspaces. Running one does not require the other to be running.

## Firebase configuration

The attendee app reads Firebase settings from Vite environment variables in `apps/attendee/firebase.js`. Create `apps/attendee/.env.local` and populate it with the values for your Firebase web app:

```dotenv
VITE_FIREBASE_API_KEY=your-firebase-web-api-key
VITE_FIREBASE_AUTH_DOMAIN=your-project-id.firebaseapp.com
VITE_FIREBASE_DATABASE_URL=https://your-project-id-default-rtdb.firebaseio.com
VITE_FIREBASE_PROJECT_ID=your-project-id
VITE_FIREBASE_STORAGE_BUCKET=your-project-id.firebasestorage.app
VITE_FIREBASE_MESSAGING_SENDER_ID=your-sender-id
VITE_FIREBASE_APP_ID=your-firebase-app-id
VITE_FIREBASE_MEASUREMENT_ID=G-XXXXXXXXXX
```

These values are available in the Firebase console under your project's web app configuration. The measurement ID is only needed for Analytics, but the current Firebase module initializes Analytics unconditionally; use a supported browser environment and configure Analytics for the project if retaining this initialization.

Before testing profile creation:

1. Enable **Anonymous** as a sign-in provider in Firebase Authentication.
2. Create a Cloud Firestore database.
3. Review and deploy Firestore security rules appropriate to your application before using real attendee data.
4. Configure Realtime Database if you keep its initialization in `firebase.js`; the current attendee workflow does not otherwise use it.

The `.env.local` file is ignored by Git. Do not commit private service-account credentials or other secrets. Firebase web configuration values are intended for client initialization, but they do not replace Firebase Authentication, security rules, App Check, or appropriate abuse controls.

## Running and building the apps

### Attendee

```bash
npm run dev:attendee
npm run build --workspace=apps/attendee
npm run lint --workspace=apps/attendee
npm run preview --workspace=apps/attendee
```

The build runs the app's TypeScript project check followed by a Vite production build. The app uses `.jsx` component files; its TypeScript app configuration enables JavaScript source participation so the TypeScript entry point can import them.

### Organizer

```bash
npm run dev:organizer
npm run build --workspace=apps/organizer
npm run lint --workspace=apps/organizer
npm run preview --workspace=apps/organizer
```

The organizer workspace currently contains a Vite/React scaffold with an empty application view. It is included as a place to build organizer functionality, not as a usable organizer product yet.

There is currently no root `test` script or automated test suite configured.

## Current attendee workflows

### Profile and pass

1. The app signs the visitor in anonymously with Firebase Authentication when no user is already authenticated.
2. It reads the document at `profiles/{firebase-auth-uid}` from Cloud Firestore.
3. The attendee can enter a name, headline, and phone number and save them to that profile document.
4. A QR badge is shown after a profile with a name is available.

### Scan a pass

The scan view uses the browser camera through `html5-qrcode`. A scanned attendee ID is used to fetch the corresponding `profiles/{uid}` document and display the available public profile fields. Camera use requires browser permission and may not work on an insecure non-localhost origin.

## Data and QR format

The attendee app currently stores profile documents in the Firestore `profiles` collection. The fields written by the profile form are:

| Field | Meaning |
| --- | --- |
| `full_name` | Attendee's display name; required by the form |
| `headline` | Optional short role or introduction |
| `phone` | Optional phone number |
| `updated_at` | ISO-8601 timestamp set when the profile is saved |

The generated QR payload is `bifrost://connect/{uid}`. The scanner also accepts a plain UID. This is an application-level payload convention; it does not itself grant safe access to a profile. Firestore security rules must define which profile fields a signed-in user can read or update. Review whether exposing phone numbers through attendee lookup is appropriate for your event and privacy requirements.

## Shared types

`packages/shared-types` is named `@bifrost/shared-types` in the workspace. It currently defines TypeScript contracts for:

- `BifrostEvent`
- `AttendeeProfile`
- `Connection`
- `EventRole`

These types describe the intended domain but are not currently imported by the attendee or organizer app. The current attendee profile fields and Firestore document shape do not yet match the shared `AttendeeProfile` interface one-to-one; reconcile those models before relying on the shared package as a backend contract.

## Development notes

- Install dependencies at the repository root with `npm install`; do not install each app independently.
- Keep app-specific components, styling, and Vite configuration inside the relevant `apps/<name>` directory.
- Put reusable cross-app contracts in `packages/shared-types` and add explicit workspace dependencies when an app begins importing them.
- Vite client environment variables must use the `VITE_` prefix. Restart the relevant dev server after changing environment files.
- The attendee app uses JSX for most UI components. New components may remain `.jsx` unless they need TypeScript-only features; TypeScript infrastructure code can use `.ts` or `.tsx`.
- Keep Firebase security rules aligned with the intended profile visibility and editing model. Anonymous authentication is not identity verification.

## Roadmap

The following are product directions from the original project brief, not claims that these features are implemented:

- Event creation, event membership, and organizer controls
- Mutual contact exchange and downloadable contact cards
- Event-scoped attendee discovery and proximity presence
- Organizer analytics and networking summaries
- Resilient offline workflows and synchronization
- Production PWA behavior, accessibility review, and end-to-end tests

## Troubleshooting

### Firebase configuration or profile loading errors

- Confirm `apps/attendee/.env.local` exists and each required `VITE_FIREBASE_*` value matches the Firebase web app.
- Restart Vite after changing environment variables.
- Confirm Anonymous sign-in is enabled and Firestore exists in the selected Firebase project.
- Check the browser console and Firestore rules for denied requests.

### QR scanner cannot use the camera

- Allow camera access when prompted.
- Use `localhost` during local development or serve the app over HTTPS.
- Try a supported browser and close other tabs or apps currently using the camera.

### Workspace commands cannot find a package

Run npm commands from the repository root and confirm dependencies have been installed with `npm install`.