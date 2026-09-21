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

// Google throttles bursts of calendar writes, so each run makes at most this
// many changes and schedules itself to continue a few minutes later.
const MAX_CHANGES_PER_RUN = 40;
const RESUME_AFTER_MINUTES = 10;
const PAUSE = new Error('pause');

function setup() {
  deleteTriggers_('sync');
  ScriptApp.newTrigger('sync').timeBased().everyDays(1).atHour(3).create();
  sync();
}

function resumeSync() {
  sync();
}

function sync() {
  deleteTriggers_('resumeSync');
  const festivals = fetchFestivals_();
  const cal = getOrCreateCalendar_();
  const tz = Session.getScriptTimeZone();

  const wanted = new Map(festivals.map(f => [f.date + '|' + title_(f), f]));
  // Also match the English titles earlier versions used, so those get renamed in place.
  const byEnglish = new Map(festivals.map(f => [f.date + '|' + f.title, f]));
  const dates = festivals.map(f => f.date).sort();
  const from = toDate_(dates[0]);
  const to = toDate_(dates[dates.length - 1]);
  to.setDate(to.getDate() + 1);

  const n = { kept: 0, updated: 0, removed: 0, added: 0 };
  let changes = 0;
  const change = fn => {
    if (changes >= MAX_CHANGES_PER_RUN) throw PAUSE;
    fn();
    changes++;
    Utilities.sleep(1000);
  };

  try {
    for (const ev of cal.getEvents(from, to)) {
      const day = Utilities.formatDate(ev.getAllDayStartDate(), tz, 'yyyy-MM-dd');
      const f = wanted.get(day + '|' + ev.getTitle()) || byEnglish.get(day + '|' + ev.getTitle());
      const key = f && day + '|' + title_(f);
      if (f && wanted.has(key)) {
        wanted.delete(key);
        // Untagged matches are leftovers from a run that stopped mid-create; adopt them.
        const untagged = ev.getTag(TAG) !== '1';
        if (untagged || ev.getTitle() !== title_(f) || ev.getDescription() !== describe_(f)) {
          change(() => {
            ev.setTitle(title_(f));
            ev.setDescription(describe_(f));
            if (untagged) ev.resetRemindersToDefault();
            ev.setTag(TAG, '1');
          });
          n.updated++;
        } else n.kept++;
      } else if (ev.getTag(TAG) === '1') {
        change(() => ev.deleteEvent());
        n.removed++;
      }
    }
    for (const f of wanted.values()) {
      change(() => {
        const ev = cal.createAllDayEvent(title_(f), toDate_(f.date), { description: describe_(f) });
        ev.setTag(TAG, '1');
        ev.resetRemindersToDefault();
      });
      n.added++;
    }
  } catch (e) {
    if (e !== PAUSE && !/too many/i.test(e.message)) throw e;
    ScriptApp.newTrigger('resumeSync').timeBased().after(RESUME_AFTER_MINUTES * 60 * 1000).create();
    console.log(`Paused to stay under Google's limit; continues by itself in ${RESUME_AFTER_MINUTES} min. ` +
      `So far: ${n.added} added, ${n.updated} updated, ${n.removed} removed.`);
    return;
  }

  console.log(`"${CALENDAR_NAME}" is up to date: ${n.added} added, ${n.updated} updated, ` +
    `${n.removed} removed, ${n.kept} unchanged.`);
}

function deleteTriggers_(handler) {
  ScriptApp.getProjectTriggers()
    .filter(t => t.getHandlerFunction() === handler)
    .forEach(t => ScriptApp.deleteTrigger(t));
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
