/**
 * Odia Festivals -> Google Calendar
 *
 * Keeps a calendar called "Odia Festivals" in your Google account in sync
 * with festivals.json. Reminders come from the calendar's own "all-day
 * notification" defaults, so you set them once and every festival follows.
 *
 * Run `setup` once: it syncs now and installs a daily trigger, so later
 * changes to festivals.json (new years, corrected dates) arrive by
 * themselves. Only touches events this script created.
 */

const DATA_URL = 'https://raw.githubusercontent.com/rudrapr/odia-festivals/main/festivals.json';
const CALENDAR_NAME = 'Odia Festivals';
const CALENDAR_COLOR = '#F4511E'; // tangerine, stands apart from the green holiday chips
const TAG = 'odiaFestival';

function setup() {
  ScriptApp.getProjectTriggers()
    .filter(t => t.getHandlerFunction() === 'sync')
    .forEach(t => ScriptApp.deleteTrigger(t));
  ScriptApp.newTrigger('sync').timeBased().everyDays(1).atHour(3).create();
  sync();
}

function sync() {
  const festivals = fetchFestivals_();
  const cal = getOrCreateCalendar_();
  const tz = Session.getScriptTimeZone();

  const wanted = new Map(festivals.map(f => [f.date + '|' + title_(f), f]));
  const dates = festivals.map(f => f.date).sort();
  const from = toDate_(dates[0]);
  const to = toDate_(dates[dates.length - 1]);
  to.setDate(to.getDate() + 1);

  let kept = 0, removed = 0, added = 0;
  cal.getEvents(from, to).forEach(ev => {
    if (ev.getTag(TAG) !== '1') return;
    const key = Utilities.formatDate(ev.getAllDayStartDate(), tz, 'yyyy-MM-dd') + '|' + ev.getTitle();
    const f = wanted.get(key);
    if (f) {
      wanted.delete(key);
      if (ev.getDescription() !== describe_(f)) ev.setDescription(describe_(f));
      kept++;
    } else { ev.deleteEvent(); removed++; }
  });

  wanted.forEach(f => {
    const ev = cal.createAllDayEvent(title_(f), toDate_(f.date), { description: describe_(f) });
    ev.setTag(TAG, '1');
    ev.resetRemindersToDefault();
    added++;
    Utilities.sleep(300); // stay under Calendar's rate limit
  });

  console.log(`"${CALENDAR_NAME}": ${added} added, ${kept} already there, ${removed} removed.`);
}

// Refuses to sync on a bad download, so a broken file can never wipe the calendar.
function fetchFestivals_() {
  const res = UrlFetchApp.fetch(DATA_URL, { muteHttpExceptions: true });
  if (res.getResponseCode() !== 200) {
    throw new Error(`Couldn't download festivals.json (HTTP ${res.getResponseCode()}). Calendar left unchanged.`);
  }
  const list = JSON.parse(res.getContentText());
  const valid = Array.isArray(list) && list.length >= 20 &&
    list.every(f => /^\d{4}-\d{2}-\d{2}$/.test(f.date) && f.title);
  if (!valid) throw new Error('festivals.json looks malformed. Calendar left unchanged.');
  return list;
}

function getOrCreateCalendar_() {
  const found = CalendarApp.getCalendarsByName(CALENDAR_NAME).find(c => c.isOwnedByMe());
  if (found) return found;
  const cal = CalendarApp.createCalendar(CALENDAR_NAME, {
    summary: 'Odia festivals and observances (Odisha panjika dates).',
    timeZone: 'Asia/Kolkata',
    color: CALENDAR_COLOR,
  });
  console.log(`Created calendar "${CALENDAR_NAME}".`);
  return cal;
}

// Grid chips show the first Odia name; the rest, plus English, go in the details.
function title_(f) {
  return f.odia.split(' / ')[0];
}

function describe_(f) {
  const note = f.status === 'tentative' ? '\n\nDate tentative until the official calendar is out.' : '';
  return `${f.odia}\n${f.title}: ${f.description}${note}`;
}

function toDate_(iso) {
  const [y, m, d] = iso.split('-').map(Number);
  return new Date(y, m - 1, d);
}
