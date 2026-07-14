This is a [Next.js](https://nextjs.org) 16 (App Router) project for **Prescription Web** — a demo ophthalmology doctor's portal for writing, editing and printing patient prescriptions.

## About This Project

Prescription Web simulates the day-to-day workflow of an eye clinic doctor:

- **Login** with a doctor account (or one of the quick-login demo buttons on the login screen).
- **Patients list** shows the doctor's patients; selecting one opens a code-confirmation dialog (pre-filled with that patient's code) before loading their chart.
- **Prescription workspace** renders the patient's chart as a single landscape "paper" with a hospital header, doctor signature footer, and sections for Complaints, Vision, History, Refraction, Diagnosis, Investigation, Plan, Rx (medicines), Glass Prediction, Advice and Follow Up.
- **Rich-text section editor** for free-text fields (bold/italic/underline, forced bullet lists, XSS-sanitized output).
- **Medicine picker** for building the Rx list, with per-item dosage, frequency, duration, left/right/both eye tagging, and preset medicine "sets" for common diagnoses.
- **Diagnosis picker** with search, favorite/common diagnosis chips (per doctor), and the same left/right/both eye tagging.
- **Print/PDF output** that reproduces the on-screen prescription paper as a single printable page.

All data (doctors, hospital info, patients, medicines, medicine sets, diagnoses) is **demo data** bundled with the project — there's nothing to configure or connect before you can try the app end to end.

## Tech Stack

- [Next.js 16](https://nextjs.org) (App Router, Turbopack dev server)
- [React 19](https://react.dev)
- [MUI v9](https://mui.com) (`@mui/material`, `@mui/icons-material`)
- [Tailwind CSS v4](https://tailwindcss.com) (for base resets/utilities alongside MUI)
- TypeScript throughout

## Getting Started

Install dependencies and run the development server:

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser — you'll be redirected to the login page.

Other available scripts:

```bash
npm run build   # production build
npm run start   # run the production build
npm run lint    # run ESLint
```

## Trying the Demo

Log in with any of the demo doctor accounts shown on the login page's quick-login buttons (all use password `1234`), then open the **Patients** page. Three demo patients are included, each set up to showcase a different part of the app:

- **0000-506025 (Md. Rahim Uddin)** — a mostly complete chart with multiple tagged diagnoses and a full Rx list, but a few sections intentionally left empty.
- **0000-506026 (Sharmin Akter)** — a minimal chart (only Complaints, Vision and History filled in) to show the empty-state of every other section.
- **0000-506027 (Abdul Karim)** — a fully completed chart across every section, useful for reviewing the complete prescription sheet and print output.

The Patients page itself includes an in-app guide describing the workflow and each demo patient in more detail.

## Project Structure

```
app/                     Next.js App Router routes (login, portal, API routes)
components/              UI components (portal shell, prescription workspace, dialogs)
lib/                     Repositories, auth/session helpers, shared utilities
data/                    Bundled demo data
types/                   Shared TypeScript types
```

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
