# SM Daily Routine - Service Manager Daily Checklist

A simple, client-side React + Vite web app for the Service Manager at **Hyundai / SS Automarts / Kovai Hyundai**.
It lists the 13 routine jobs of the day, shows reminder pop-ups at each job's start time, and tracks completion.

- No backend, no database, no login, no API.
- Only dependencies: `react`, `react-dom`, `vite`.
- Today's checklist is stored in the browser's `localStorage` (key `smRoutine_YYYY-MM-DD`).
- A new date automatically starts a fresh checklist (yesterday's status is never carried over).

## Features

- Dashboard: today's date, live current time, next routine, Total / Completed / Pending / Progress %, live progress bar
- 13 routine jobs (Time, Area, Task, Remarks, Status, Action) with **NOW**, **NEXT UP** and **Overdue** markers
- Mark Completed / Mark as Pending with completion time saved
- Reminder pop-up at each job's start time (Mark Completed, Remind me in 5 min, Close)
- Optional browser (desktop) notifications, with the in-app pop-up always shown as the reliable fallback
- No duplicate reminders; no spam of old reminders when the page is opened late
- "Reset Today's Checklist" with confirmation
- Responsive: table/card layout on desktop, cards on tablet, stacked on mobile

## Install

```bash
npm install
```

## Run locally

```bash
npm run dev
```

Open the URL shown in the terminal (normally http://localhost:5173).

## Build

```bash
npm run build
```

The static site is created in the `dist` folder. Preview it with `npm run preview`.

## Deploy to Render (Static Site)

1. Push this project to a Git repository (GitHub / GitLab / Bitbucket).
2. In Render choose **New + > Static Site** and select the repository.
3. Use these settings:

| Setting           | Value                              |
| ----------------- | ---------------------------------- |
| Build Command     | `npm install && npm run build`     |
| Publish Directory | `dist`                             |

No environment variables, server or database are needed. The app is a single page, so no rewrite rules are required.

## How reminders and notifications work

- Reminders fire at each job's **start time** using the browser's local clock (no time zone is hard-coded).
  For example, `9.00 - 9.15 am` triggers at 9:00 AM, `9.20 - 10.00 am` at 9:20 AM.
- Reminders work **while the web app is open** in a browser tab (a timer checks the time every second).
- An **in-app pop-up** always appears and is the reliable fallback.
- **Browser notifications** are used in addition when the user clicks *Enable Notifications* and allows the browser permission.
  If permission is denied, the app keeps working with in-app pop-ups.
- A static website **cannot guarantee notifications when the browser or page is completely closed**. Keep the tab open
  (it can be in the background) to receive reminders. Browsers may slow timers in long-inactive background tabs.
- If the page is opened after a job's start time, old reminders are **not** replayed (only reminders within 5 minutes of
  their start time are shown). Incomplete earlier jobs are marked **Overdue**.
- Each job's reminder is shown once per day (state is stored in `localStorage`), unless you choose *Remind me* (5 minutes).

## Editing the routine

All jobs live in `src/data/routineData.js`. Each job has `time` (start, 24-hour `HH:MM`, used for the reminder),
`end` (used for NOW / Overdue), `displayTime`, `area`, `task` and `remarks`.

## Logos

No logo files were supplied, so the header uses clean text branding. To use official logos, put them in
`public/assets/` and reference them in `src/components/Header.jsx`.
