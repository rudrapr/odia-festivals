// Share button, and the festival list's "today / in N days" labels.
(() => {
  const or = document.documentElement.lang === 'or';
  const digits = n => or ? String(n).replace(/\d/g, d => '୦୧୨୩୪୫୬୭୮୯'[d]) : String(n);
  const soonLabel = days =>
    days === 0 ? (or ? 'ଆଜି' : 'Today') :
    days === 1 ? (or ? 'କାଲି' : 'Tomorrow') :
    or ? `ଆଉ ${digits(days)} ଦିନ` : `In ${days} days`;

  const share = document.getElementById('share');
  share?.addEventListener('click', async e => {
    e.preventDefault();
    const url = location.href.split('#')[0];
    const text = share.dataset.text;
    if (navigator.share) {
      try { await navigator.share({ title: document.title, text, url }); return; }
      catch (err) { if (err.name === 'AbortError') return; }
    }
    location.href = 'https://wa.me/?text=' + encodeURIComponent(`${text} ${url}`);
  });

  // The list is static HTML (so search engines read it); here we hide what's past.
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  for (const li of document.querySelectorAll('.fest li[data-date]')) {
    const [y, m, d] = li.dataset.date.split('-').map(Number);
    const days = Math.round((new Date(y, m - 1, d) - today) / 864e5);
    if (days < 0) { li.hidden = true; continue; }
    if (days <= 30) {
      const s = document.createElement('span');
      s.className = 'soon';
      s.textContent = soonLabel(days);
      li.querySelector('.what').append(s);
    }
  }
  for (const month of document.querySelectorAll('.month')) {
    if (![...month.querySelectorAll('li')].some(li => !li.hidden)) month.hidden = true;
  }
})();
