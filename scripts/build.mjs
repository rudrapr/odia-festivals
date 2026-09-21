// Builds the public site from festivals.json: index.html (Odia), en/index.html
// (English) and sitemap.xml. Run after every change to festivals.json.
//   node scripts/build.mjs          write the files
//   node scripts/build.mjs --check  exit 1 if the committed files are stale
import { readFileSync, writeFileSync, mkdirSync, existsSync } from 'node:fs';
import { dirname } from 'node:path';

const SITE = 'https://rudrapr.github.io/odia-festivals/';
const CAL_ID = 'c2ad49a7d7891a2640383f603f33c80da3f75f90c5ab0ab69e49f555d8b5d71c@group.calendar.google.com';
const SUBSCRIBE_URL = `https://calendar.google.com/calendar/u/0?cid=${Buffer.from(CAL_ID).toString('base64')}`;
const IPHONE_URL = `webcal://calendar.google.com/calendar/ical/${encodeURIComponent(CAL_ID)}/public/basic.ics`;
// Google Search Console verification token (the content="…" of its HTML tag), once there is one.
const GOOGLE_VERIFICATION = '';

const root = new URL('..', import.meta.url);
const festivals = JSON.parse(readFileSync(new URL('festivals.json', root), 'utf8'));

const esc = s => String(s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[c]);
const odiaDigits = s => String(s).replace(/\d/g, d => '୦୧୨୩୪୫୬୭୮୯'[d]);
const years = [...new Set(festivals.map(f => f.date.slice(0, 4)))];
const yearRange = years.length > 1 ? `${years[0]}–${years[years.length - 1]}` : years[0];

const L = {
  or: {
    path: '', base: '', locale: 'or_IN',
    title: `ଓଡ଼ିଆ ପର୍ବପର୍ବାଣି କ୍ୟାଲେଣ୍ଡର ${odiaDigits(yearRange)} | ସବୁ ଓଡ଼ିଆ ପର୍ବର ତାରିଖ`,
    description: `${odiaDigits(yearRange)} ର ସବୁ ଓଡ଼ିଆ ପର୍ବର ତାରିଖ: ରଜ, ରଥଯାତ୍ରା, କୁମାର ପୂର୍ଣ୍ଣିମା, ମାଣବସା ଗୁରୁବାର, ନୂଆଖାଇ ଓ ଆହୁରି ଅନେକ। ଗୁଗୁଲ କ୍ୟାଲେଣ୍ଡରରେ ମାଗଣାରେ ଯୋଡ଼ନ୍ତୁ ଓ ପର୍ବ ଆଗରୁ ସୂଚନା ପାଆନ୍ତୁ।`,
    siteName: 'ଓଡ଼ିଆ ପର୍ବପର୍ବାଣି',
    fonts: 'family=Baloo+Bhaina+2:wght@600;700&family=Noto+Sans+Oriya:wght@400;500;700',
    switchTo: { href: 'en/', lang: 'en', label: 'English' },
    h1: 'ଓଡ଼ିଆ ପର୍ବପର୍ବାଣି',
    lead: 'ସବୁ ଓଡ଼ିଆ ପର୍ବ ଆପଣଙ୍କ ଗୁଗୁଲ କ୍ୟାଲେଣ୍ଡରରେ। ମାଗଣା, ଆଉ ଆପେ ଆପେ ଅପଡେଟ ହୁଏ।',
    names: ['ରଜ', 'ରଥଯାତ୍ରା', 'କୁମାର ପୂର୍ଣ୍ଣିମା', 'ମାଣବସା ଗୁରୁବାର', 'ଖୁଦୁରୁକୁଣୀ ଓଷା', 'ନୂଆଖାଇ', 'ବୋଇତ ବନ୍ଦାଣ', 'ପ୍ରଥମାଷ୍ଟମୀ'],
    namesLabel: 'କିଛି ପର୍ବ',
    addGoogle: 'ଗୁଗୁଲ କ୍ୟାଲେଣ୍ଡରରେ ଯୋଡ଼ନ୍ତୁ',
    addIphone: 'ଆଇଫୋନରେ ଯୋଡ଼ନ୍ତୁ',
    share: 'ସେୟାର କରନ୍ତୁ',
    shareText: 'ସବୁ ଓଡ଼ିଆ ପର୍ବ ନିଜ ଗୁଗୁଲ କ୍ୟାଲେଣ୍ଡରରେ ପାଆନ୍ତୁ, ମାଗଣା:',
    signin: 'ଆପଣଙ୍କ ଗୁଗୁଲ ଆକାଉଣ୍ଟରେ ସାଇନ ଇନ ହୋଇଥିବା ଦରକାର।',
    howTitle: 'କିପରି ଯୋଡ଼ିବେ',
    how: [
      'ଉପରେ ଥିବା <b>ଗୁଗୁଲ କ୍ୟାଲେଣ୍ଡରରେ ଯୋଡ଼ନ୍ତୁ</b> ବଟନ ଦବାନ୍ତୁ।',
      'ଗୁଗୁଲ କ୍ୟାଲେଣ୍ଡର ଖୋଲିବ। ସେଠାରେ <span class="en">Add</span> ଦବାନ୍ତୁ।',
      'ସରିଗଲା! କିଛି ସମୟ ପରେ ପର୍ବଗୁଡ଼ିକ ଆପଣଙ୍କ ଫୋନର କ୍ୟାଲେଣ୍ଡର ଓ ୱିଜେଟରେ ଦେଖାଯିବ। ପର୍ବ ଉପରେ ଦବାଇଲେ ତାହାର ବିବରଣୀ ଦେଖିପାରିବେ।',
    ],
    troubleTitle: 'ଫୋନରେ ଅସୁବିଧା ହେଉଛି କି?',
    trouble: [
      'ବଟନ ଦବାଇଲେ କିଛି ନହେଲେ, ବ୍ରାଉଜରର <b>⋮</b> ମେନୁରୁ <span class="en">Desktop site</span> ବାଛନ୍ତୁ, ତାପରେ ପୁଣି ବଟନ ଦବାନ୍ତୁ।',
      'ଯୋଡ଼ିବା ପରେ ବି ଫୋନରେ ପର୍ବ ଦେଖାଯାଉନଥିଲେ, ଗୁଗୁଲ କ୍ୟାଲେଣ୍ଡର ଆପ ଖୋଲନ୍ତୁ → <b>☰</b> → <span class="en">Settings</span> → <span class="en">Odia Festivals</span> → <span class="en">Sync</span> ଚାଲୁ କରନ୍ତୁ।',
    ],
    remindTitle: 'ରିମାଇଣ୍ଡର ସେଟ କରନ୍ତୁ',
    remindLead: 'ପର୍ବର ଏକ ସପ୍ତାହ ଆଗରୁ, ତିନି ଦିନ ଆଗରୁ, ଆଗଦିନ ଏବଂ ପର୍ବ ଦିନ ଫୋନରେ ସୂଚନା ପାଇପାରିବେ।',
    remind: [
      'ଗୁଗୁଲ କ୍ୟାଲେଣ୍ଡର ଆପ ଖୋଲନ୍ତୁ → ଉପରେ ବାମ ପଟେ <b>☰</b> → <span class="en">Settings</span>।',
      'ତାଲିକାରୁ <span class="en">Odia Festivals</span> ବାଛନ୍ତୁ।',
      '<span class="en">all-day</span> ଲେଖାଥିବା ନୋଟିଫିକେସନ ବିକଳ୍ପରେ ଆପଣ ଚାହୁଁଥିବା ସମୟ ଯୋଡ଼ନ୍ତୁ:',
    ],
    remindChips: [['1 week before', 'ଏକ ସପ୍ତାହ ଆଗରୁ'], ['3 days before', 'ତିନି ଦିନ ଆଗରୁ'], ['The day before', 'ଆଗଦିନ'], ['On the day', 'ପର୍ବ ଦିନ']],
    remindNote: 'ତାଲିକାରେ ନଥିଲେ <span class="en">Custom</span> ବାଛି ନିଜେ ଦିନ ଲେଖନ୍ତୁ। ଏହା କେବଳ ଏହି ପର୍ବ କ୍ୟାଲେଣ୍ଡର ପାଇଁ। ଆପଣଙ୍କ ଅନ୍ୟ ଇଭେଣ୍ଟ ଉପରେ କିଛି ପ୍ରଭାବ ପଡ଼ିବ ନାହିଁ।',
    listTitle: `ଓଡ଼ିଆ ପର୍ବ ତାଲିକା ${odiaDigits(yearRange)}`,
    listNote: 'ଓଡ଼ିଶାରେ ପାଳନ ହେଉଥିବା ତାରିଖ ଅନୁସାରେ। <b>ଅନିଶ୍ଚିତ</b> ଲେଖାଥିବା ତାରିଖ ସରକାରୀ ପଞ୍ଜିକା ବାହାରିଲେ ନିଶ୍ଚିତ କରାଯିବ।',
    tentative: 'ଅନିଶ୍ଚିତ',
    months: ['ଜାନୁଆରୀ', 'ଫେବୃଆରୀ', 'ମାର୍ଚ୍ଚ', 'ଅପ୍ରେଲ', 'ମେ', 'ଜୁନ', 'ଜୁଲାଇ', 'ଅଗଷ୍ଟ', 'ସେପ୍ଟେମ୍ବର', 'ଅକ୍ଟୋବର', 'ନଭେମ୍ବର', 'ଡିସେମ୍ବର'],
    weekdays: ['ରବି', 'ସୋମ', 'ମଙ୍ଗଳ', 'ବୁଧ', 'ଗୁରୁ', 'ଶୁକ୍ର', 'ଶନି'],
    num: odiaDigits,
    name: f => f.odia.split(' / ')[0],
    sub: f => f.odia.split(' / ').slice(1).join(' / '),
    faqTitle: 'ସାଧାରଣ ପ୍ରଶ୍ନ',
    faq: [
      ['ଏହା ମାଗଣା କି?', 'ହଁ, ସମ୍ପୂର୍ଣ୍ଣ ମାଗଣା। କୌଣସି ଆପ ଇନଷ୍ଟଲ କରିବାକୁ ପଡ଼ିବ ନାହିଁ।'],
      ['ମୋ ପାଖକୁ ଇମେଲ କିମ୍ବା ନିମନ୍ତ୍ରଣ ଆସିବ କି?', 'ନା। କୌଣସି ଇମେଲ, ମେସେଜ କିମ୍ବା ନିମନ୍ତ୍ରଣ ପଠାଯାଏ ନାହିଁ। ଆପଣ ନିଜେ ଯୋଡ଼ିଲେ ହିଁ ପର୍ବଗୁଡ଼ିକ ଦେଖାଯିବ।'],
      ['ମୋ କ୍ୟାଲେଣ୍ଡର ବା ତଥ୍ୟ କେହି ଦେଖିପାରିବେ କି?', 'ନା। ଆପଣ କେବଳ ପର୍ବ ତାଲିକା ଦେଖନ୍ତି। ଆପଣଙ୍କ ନିଜ କ୍ୟାଲେଣ୍ଡର, ଇମେଲ କିମ୍ବା ନାମ କାହା ପାଖକୁ ଯାଏ ନାହିଁ।'],
      ['ନୂଆ ବର୍ଷର ପର୍ବ ଓ ସଂଶୋଧିତ ତାରିଖ?', 'ଆପେ ଆପେ ଅପଡେଟ ହୁଏ। ପୁଣି ଯୋଡ଼ିବା ଦରକାର ନାହିଁ।'],
      ['ତାରିଖ କେଉଁଠାରୁ ନିଆଯାଏ?', 'ଶ୍ରୀଜଗନ୍ନାଥ ମନ୍ଦିର ପ୍ରଶାସନର ପର୍ବ ପଞ୍ଜିକା, ଓଡ଼ିଶା ସରକାରଙ୍କ ଛୁଟି ବିଜ୍ଞପ୍ତି ଏବଂ କୋହିନୂର ପାଞ୍ଜିରୁ। ଯେଉଁ ତାରିଖ ଏଯାଏଁ ନିଶ୍ଚିତ ହୋଇନାହିଁ, ତାହା ପର୍ବର ବିବରଣୀରେ ଲେଖାଥାଏ ଏବଂ ସରକାରୀ ପଞ୍ଜିକା ବାହାରିଲେ ଠିକ କରାଯାଏ।'],
      ['କ୍ୟାଲେଣ୍ଡର କିପରି ହଟାଇବି?', 'କମ୍ପ୍ୟୁଟର କିମ୍ବା ବ୍ରାଉଜରରେ <span class="en">calendar.google.com</span> ଖୋଲନ୍ତୁ → <span class="en">Settings</span> → <span class="en">Odia Festivals</span> → <span class="en">Unsubscribe</span>।'],
      ['ଭୁଲ ତାରିଖ ଦେଖିଲେ କ\'ଣ କରିବି?', '<a href="https://github.com/rudrapr/odia-festivals/issues">ଏଠାରେ ଜଣାନ୍ତୁ</a>। କେଉଁ ପାଞ୍ଜି ବା ପଞ୍ଜିକାରେ ଠିକ ତାରିଖ ଅଛି, ତାହା ମଧ୍ୟ ଲେଖନ୍ତୁ।'],
    ],
    footer: 'ଓଡ଼ିଆ ପର୍ବପର୍ବାଣି କ୍ୟାଲେଣ୍ଡର',
  },
  en: {
    path: 'en/', base: '../', locale: 'en_IN',
    title: `Odia Festival Calendar ${yearRange}: Odia Festivals List with Dates`,
    description: `Dates of every Odia festival in ${yearRange}: Raja Parba, Ratha Yatra, Kumar Purnima, Manabasa Gurubar, Nuakhai and more. Add them to Google Calendar free, with reminders.`,
    siteName: 'Odia Festival Calendar',
    fonts: 'family=Baloo+Bhaina+2:wght@600;700&family=Noto+Sans:wght@400;500;600;700&family=Noto+Sans+Oriya:wght@400;500',
    switchTo: { href: '../', lang: 'or', label: 'ଓଡ଼ିଆ' },
    h1: 'Odia Festival Calendar',
    lead: 'Every Odia festival in your Google Calendar. Free, and it keeps itself up to date.',
    names: ['Raja Parba', 'Ratha Yatra', 'Kumar Purnima', 'Manabasa Gurubar', 'Khudurukuni Osha', 'Nuakhai', 'Boita Bandana', 'Prathamastami'],
    namesLabel: 'Some of the festivals',
    addGoogle: 'Add to Google Calendar',
    addIphone: 'Add on iPhone',
    share: 'Share',
    shareText: 'Every Odia festival in your Google Calendar, free:',
    signin: 'You need to be signed in to your Google account.',
    howTitle: 'How to add it',
    how: [
      'Tap <b>Add to Google Calendar</b> above.',
      'Google Calendar opens. Tap <span class="en">Add</span>.',
      'Done. In a few minutes the festivals appear in your phone’s calendar and widget, in Odia. Tap one to see its details.',
    ],
    troubleTitle: 'Having trouble on your phone?',
    trouble: [
      'If nothing happens when you tap the button, open your browser’s <b>⋮</b> menu, choose <span class="en">Desktop site</span>, and tap the button again.',
      'If the festivals still don’t show on your phone, open the Google Calendar app → <b>☰</b> → <span class="en">Settings</span> → <span class="en">Odia Festivals</span> and turn on <span class="en">Sync</span>.',
    ],
    remindTitle: 'Set reminders',
    remindLead: 'Get a notification a week before, 3 days before, the day before, and on the day of each festival.',
    remind: [
      'Open the Google Calendar app → <b>☰</b> (top left) → <span class="en">Settings</span>.',
      'Choose <span class="en">Odia Festivals</span>.',
      'Under the <span class="en">all-day</span> notifications option, add the ones you want:',
    ],
    remindChips: [['1 week before', ''], ['3 days before', ''], ['The day before', ''], ['On the day', '']],
    remindNote: 'If one isn’t listed, choose <span class="en">Custom</span> and enter the number of days. This only affects the festival calendar, not your other events.',
    listTitle: `Odia festivals ${yearRange} with dates`,
    listNote: 'Dates as observed in Odisha. Dates marked <b>tentative</b> are confirmed once the official calendars are published.',
    tentative: 'Tentative',
    months: ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'],
    weekdays: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'],
    num: String,
    name: f => f.title,
    sub: f => f.odia,
    desc: f => f.description,
    faqTitle: 'Questions',
    faq: [
      ['Is it free?', 'Yes, completely. There’s nothing to install.'],
      ['Will I get emails or invitations?', 'No. Nothing is ever sent to you. The festivals appear only because you added the calendar yourself.'],
      ['Can anyone see my calendar or details?', 'No. You only see the festival list. Your own calendar, email and name aren’t shared with anyone.'],
      ['What about next year’s festivals and corrected dates?', 'They update automatically. You don’t need to add the calendar again.'],
      ['Where do the dates come from?', 'The Shree Jagannath Temple Administration’s festival calendar, the Government of Odisha holiday notification, and the Kohinoor Panjika. Dates not yet confirmed say so in the event details and are corrected when the official calendars come out.'],
      ['How do I remove it?', 'On a computer or in a browser, open <span class="en">calendar.google.com</span> → <span class="en">Settings</span> → <span class="en">Odia Festivals</span> → <span class="en">Unsubscribe</span>.'],
      ['Found a wrong date?', '<a href="https://github.com/rudrapr/odia-festivals/issues">Tell us here</a>, and mention which panjika or calendar has the correct date.'],
    ],
    footer: 'Odia Festival Calendar',
  },
};

function festivalList(t) {
  const byMonth = new Map();
  for (const f of festivals) {
    const k = f.date.slice(0, 7);
    if (!byMonth.has(k)) byMonth.set(k, []);
    byMonth.get(k).push(f);
  }
  return [...byMonth].map(([ym, list]) => {
    const [y, m] = ym.split('-').map(Number);
    const items = list.map(f => {
      const d = new Date(`${f.date}T00:00:00Z`);
      const sub = t.sub(f);
      const desc = t.desc?.(f);
      return `        <li data-date="${f.date}"><time class="when" datetime="${f.date}"><b>${t.num(d.getUTCDate())}</b>${t.weekdays[d.getUTCDay()]}</time><span class="what">${esc(t.name(f))}${f.status === 'tentative' ? `<span class="tentative">${t.tentative}</span>` : ''}${sub ? `<span class="alt" lang="or">${esc(sub)}</span>` : ''}${desc ? `<span class="desc">${esc(desc)}</span>` : ''}</span></li>`;
    }).join('\n');
    return `    <div class="month">\n      <h3>${t.months[m - 1]} ${t.num(y)}</h3>\n      <ul class="fest">\n${items}\n      </ul>\n    </div>`;
  }).join('\n');
}

function page(lang) {
  const t = L[lang];
  const url = SITE + t.path;
  const jsonLd = {
    '@context': 'https://schema.org',
    '@graph': [
      { '@type': 'WebSite', '@id': `${SITE}#website`, url: SITE, name: t.siteName, inLanguage: ['or', 'en'] },
      { '@type': 'WebPage', '@id': `${url}#page`, url, name: t.title, description: t.description, inLanguage: lang, isPartOf: { '@id': `${SITE}#website` } },
    ],
  };
  return `<!doctype html>
<!-- Generated by scripts/build.mjs from festivals.json. Edit that script, not this file. -->
<html lang="${lang}">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${esc(t.title)}</title>
<meta name="description" content="${esc(t.description)}">
<link rel="canonical" href="${url}">
<link rel="alternate" hreflang="or" href="${SITE}">
<link rel="alternate" hreflang="en" href="${SITE}en/">
<link rel="alternate" hreflang="x-default" href="${SITE}">
${GOOGLE_VERIFICATION ? `<meta name="google-site-verification" content="${GOOGLE_VERIFICATION}">\n` : ''}<meta property="og:type" content="website">
<meta property="og:url" content="${url}">
<meta property="og:site_name" content="${esc(t.siteName)}">
<meta property="og:title" content="${esc(t.title)}">
<meta property="og:description" content="${esc(t.description)}">
<meta property="og:locale" content="${t.locale}">
<meta property="og:image" content="${SITE}assets/og-${lang}.png">
<meta property="og:image:width" content="1200">
<meta property="og:image:height" content="630">
<meta name="twitter:card" content="summary_large_image">
<meta name="theme-color" content="#FBF6EE" media="(prefers-color-scheme: light)">
<meta name="theme-color" content="#1A1311" media="(prefers-color-scheme: dark)">
<link rel="icon" href="${t.base}assets/icon.svg" type="image/svg+xml">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?${t.fonts}&display=swap" rel="stylesheet">
<link rel="stylesheet" href="${t.base}assets/site.css">
<script type="application/ld+json">${JSON.stringify(jsonLd)}</script>
</head>
<body>
<main>
  <section class="hero">
    <a class="lang" href="${t.switchTo.href}" hreflang="${t.switchTo.lang}" lang="${t.switchTo.lang}">${t.switchTo.label}</a>
    <h1>${t.h1}</h1>
    <p class="lead">${t.lead}</p>
    <ul class="names" aria-label="${t.namesLabel}">
${t.names.map(n => `      <li>${n}</li>`).join('\n')}
    </ul>
    <a class="btn btn-primary" href="${esc(SUBSCRIBE_URL)}" target="_blank" rel="noopener">
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" aria-hidden="true"><rect x="3" y="5" width="18" height="16" rx="3"/><path d="M3 10h18M8 3v4M16 3v4M12 13v5M9.5 15.5h5"/></svg>
      ${t.addGoogle}
    </a>
    <div class="row">
      <a class="btn btn-secondary" href="${esc(IPHONE_URL)}">${t.addIphone}</a>
      <a class="btn btn-secondary" id="share" href="#" data-text="${esc(t.shareText)}">${t.share}</a>
    </div>
    <p class="signin">${t.signin}</p>
  </section>

  <section class="card">
    <h2>${t.howTitle}</h2>
    <ol class="steps">
${t.how.map(s => `      <li>${s}</li>`).join('\n')}
    </ol>
    <details>
      <summary>${t.troubleTitle}</summary>
${t.trouble.map(s => `      <p>${s}</p>`).join('\n')}
    </details>
  </section>

  <section class="card">
    <h2>${t.remindTitle}</h2>
    <p>${t.remindLead}</p>
    <ol class="steps">
${t.remind.slice(0, -1).map(s => `      <li>${s}</li>`).join('\n')}
      <li>${t.remind[t.remind.length - 1]}
        <div class="chips">
${t.remindChips.map(([en, local]) => `          <span><span class="en">${en}</span>${local ? ` ${local}` : ''}</span>`).join('\n')}
        </div>
      </li>
    </ol>
    <p class="note">${t.remindNote}</p>
  </section>

  <section class="card" id="festivals">
    <h2>${t.listTitle}</h2>
    <p class="note">${t.listNote}</p>
${festivalList(t)}
  </section>

  <section class="card">
    <h2>${t.faqTitle}</h2>
${t.faq.map(([q, a]) => `    <details>\n      <summary>${q}</summary>\n      <p>${a}</p>\n    </details>`).join('\n')}
  </section>

  <footer>${t.footer} · <a href="${t.switchTo.href}" hreflang="${t.switchTo.lang}" lang="${t.switchTo.lang}">${t.switchTo.label}</a></footer>
</main>
<script src="${t.base}assets/site.js" defer></script>
</body>
</html>
`;
}

const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml">
${['', 'en/'].map(p => `  <url>
    <loc>${SITE}${p}</loc>
    <xhtml:link rel="alternate" hreflang="or" href="${SITE}"/>
    <xhtml:link rel="alternate" hreflang="en" href="${SITE}en/"/>
    <xhtml:link rel="alternate" hreflang="x-default" href="${SITE}"/>
  </url>`).join('\n')}
</urlset>
`;

const outputs = { 'index.html': page('or'), 'en/index.html': page('en'), 'sitemap.xml': sitemap };

if (process.argv.includes('--check')) {
  const stale = Object.entries(outputs).filter(([p, s]) => {
    const f = new URL(p, root);
    return !existsSync(f) || readFileSync(f, 'utf8') !== s;
  });
  if (stale.length) {
    console.error(`Stale: ${stale.map(([p]) => p).join(', ')}. Run node scripts/build.mjs`);
    process.exit(1);
  }
  console.log('Site is up to date with festivals.json.');
} else {
  for (const [p, s] of Object.entries(outputs)) {
    const f = new URL(p, root);
    mkdirSync(dirname(f.pathname), { recursive: true });
    writeFileSync(f, s);
  }
  console.log(`Built ${Object.keys(outputs).join(', ')} from ${festivals.length} festivals.`);
}
