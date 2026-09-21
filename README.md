# Odia Festivals Calendar

A Google Calendar of Odia festivals and observances — Raja, Ratha Yatra and
the Puri beshas, Kumar Purnima, Manabasa Gurubar, Khudurukuni Osha, Nuakhai,
Boita Bandana, Prathamastami and more — with dates as observed in Odisha.

## Add it to your calendar

1. Open **[Add Odia Festivals to Google Calendar](__SUBSCRIBE_LINK__)** and tap **Add**.
2. In the Google Calendar app: **☰ → Settings → Odia Festivals → all-day
   notifications**, and add the reminders you want (for example 1 week, 3 days,
   1 day before, and on the day at 9 AM).
3. If it doesn't show on your phone, open that same settings page and turn on **Sync**.

New years and corrected dates show up on their own. Nothing to re-add.

iPhone / Outlook: subscribe to the iCal address `__ICAL_URL__`.

## Dates

All dates live in [`festivals.json`](festivals.json). Each entry records its
`source` and a `status` of `confirmed` or `tentative`. A date is only
`confirmed` when it comes from one of these:

1. **Shree Jagannatha Temple Administration** festival calendar
   ([shreejagannatha.in](https://www.shreejagannatha.in/calendar-of-festive-occasion-2026-2027/)),
   published every April for the Odia year.
2. **Government of Odisha holiday notification** (Revenue & Disaster
   Management Dept), published every November for the next year.
3. **Kohinoor Panjika** (print edition), for household oshas the two above
   don't list.
4. **The organiser's own announcement**, for Bali Jatra, the Nuakhai lagna and
   Dhanu Yatra.
5. **A fixed rule tied to a confirmed date**, such as Bhai Jiuntia on
   Durgashtami or Manabasa Gurubar on the Thursdays of Margashira. Fixed
   civic dates (Utkal Dibasa, Pakhala Dibasa) count too.

Anything else, including calculated panchang dates and calendar apps or sites,
stays `tentative` and says so in the event. When the temple and government
dates differ, the event uses the government (public) date and mentions the
Srimandir date.

Spotted a wrong date or a missing festival? Open an issue with the source.

## Run your own copy

Paste [`OdiaFestivals.gs`](OdiaFestivals.gs) into a new project at
[script.google.com](https://script.google.com) and run `setup`. It creates an
"Odia Festivals" calendar in your account and syncs it from `festivals.json`
daily.
