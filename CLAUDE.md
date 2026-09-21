# Odia Festivals Calendar

A public Google Calendar of Odia festivals that anyone can subscribe to.
The festival dates live in `festivals.json` in this repo (planned public
GitHub repo `rudrapr/odia-festivals`). `OdiaFestivals.gs` is a Google Apps
Script that runs in the owner's Google account. It syncs that calendar from
the raw `festivals.json` every day.

## How it fits together

- `festivals.json`: one object per event, with fields
  `{date, title, odia, description, status, source}`.
  - The first Odia name (text before " / " in `odia`) becomes the event
    title shown in the calendar grid.
  - `title` is the English name. It appears in the event details.
- `OdiaFestivals.gs`:
  - `setup()` installs a daily `sync` trigger and runs a sync straight away.
  - `sync()` matches events on `date|Odia title` and only touches events
    tagged `odiaFestival`. It adds missing events, deletes ones no longer
    in the JSON (within the JSON's date range) and updates descriptions.
  - It refuses to sync if the download fails or the JSON looks malformed.
- Reminders are not set per event. Events use the calendar's all-day
  notification defaults, so each person sets their own (the owner uses 1 week,
  3 days, 1 day and on the day, at 9 AM).
- Anyone can share the calendar by making it public in Google Calendar on the
  web (Settings → Access permissions). Subscribers get updates automatically.

## Date sourcing rules (strict)

A date may be `status: "confirmed"` only if it comes from:
1. The Shree Jagannatha Temple Administration (SJTA) festival calendar,
   shreejagannatha.in/calendar-of-festive-occasion-YYYY-YYYY/ (text table)
   and shreemandira-festivals-YYYY-YYYY/ (PDF). It is published each April
   and covers the Odia year, roughly mid-April to mid-April.
2. The Government of Odisha holiday notification (Revenue & Disaster
   Management Dept, revenue.odisha.gov.in). It is published around November
   for the next calendar year. The Higher Education Dept circular is also
   accepted.
3. The Kohinoor Panjika, print edition only. There is no official website
   or app, and the "Kohinoor" apps and sites are unofficial. The owner sends
   photos of its festival pages.
4. The organiser's own announcement, for Bali Jatra (Cuttack admin), the
   Nuakhai lagna (Samaleswari temple) and Dhanu Yatra (Bargarh committee).
5. A fixed rule tied to a confirmed date, such as Bhai Jiuntia on
   Durgashtami, Chadakhai the day after Kartika Purnima, or Manabasa Gurubar
   on the Thursdays of Margashira. Fixed civic dates also count.

Everything else, including drikpanchang, calendar apps and random sites, stays
`tentative`. When SJTA and the Government differ, use the Government (public)
date and mention the Srimandir date in `description`.

## Status (Sep 2026)

- Coverage runs from Sep 2026 to Dec 2027: 107 events, 48 confirmed.
  Everything from 14 Apr 2027 onward is tentative until the SJTA 2027-28
  calendar and the Odisha 2027 holiday list come out.
- The owner ran the first version of the script, which had the data built in
  and English titles. The version here (fetches the JSON, Odia titles,
  daily trigger) is not deployed yet.
- Next steps:
  1. Push to the GitHub repo.
  2. The owner pastes the new script and runs `setup`.
  3. The owner makes the calendar public and shares the link.
  4. Fill the `__SUBSCRIBE_LINK__` and `__ICAL_URL__` placeholders in
     README.
  5. Set up a monthly scheduled Claude routine that re-checks upcoming dates
     against the allowed sources and opens a PR for the owner to review.
