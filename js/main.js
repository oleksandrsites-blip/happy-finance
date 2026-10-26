// Happy Finance — інтерактив сторінки.
document.documentElement.classList.add('js');

/* ---------- Поява першого екрана: після завантаження шрифту, щоб текст не стрибав ---------- */
const startHero = () => {
  if (document.documentElement.classList.contains('is-ready')) return;
  document.documentElement.classList.add('is-ready');
  document.querySelector('.hero [data-stamp]')?.classList.add('is-stamping');
};
(document.fonts ? Promise.race([document.fonts.ready, new Promise((r) => setTimeout(r, 900))]) : Promise.resolve())
  .then(startHero);
setTimeout(startHero, 1500); // запасний варіант, якщо шрифт вантажиться надто довго

// Контакти клієнтки: поки невідомі, вписати, коли надішле Дмитро.
const CONTACTS = {
  phone: '',     // '+380XXXXXXXXX'
  telegram: '',  // 'https://t.me/username'
  instagram: '', // 'https://instagram.com/username'
};

const clamp = (v, min = 0, max = 1) => Math.min(max, Math.max(min, v));
const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

/* ---------- Заявка: модалка (кнопки [data-lead]) і форма у фінальному блоці ---------- */
const lead = document.getElementById('lead');
const openLead = () => {
  lead.showModal();
  document.body.classList.add('lead-open');
};
document.querySelectorAll('[data-lead]').forEach((btn) => btn.addEventListener('click', openLead));
lead.querySelector('[data-close]').addEventListener('click', () => lead.close());
lead.addEventListener('click', (e) => { if (e.target === lead) lead.close(); });
lead.addEventListener('close', () => document.body.classList.remove('lead-open'));

document.querySelectorAll('[data-lead-box]').forEach((box) => {
  const form = box.querySelector('[data-form]');
  const hint = box.querySelector('[data-hint]');
  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const btn = form.querySelector('[type="submit"]');
    btn.disabled = true;
    try {
      const res = await fetch('/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams(new FormData(form)).toString(),
      });
      if (!res.ok) throw new Error(res.status);
      box.querySelector('[data-form-wrap]').hidden = true;
      const done = box.querySelector('[data-done]');
      done.hidden = false;
      done.querySelector('[data-stamp]')?.classList.add('is-stamping');
    } catch {
      btn.disabled = false;
      hint.textContent = 'Не вдалося надіслати. Спробуйте ще раз за хвилину.';
      hint.classList.add('is-error');
    }
  });
});

/* ---------- Мобільне меню ---------- */
const burger = document.querySelector('[data-burger]');
const setMenu = (open) => {
  document.body.classList.toggle('menu-open', open);
  burger.setAttribute('aria-expanded', String(open));
};
burger.addEventListener('click', () => setMenu(!document.body.classList.contains('menu-open')));
document.querySelectorAll('.menu a, .menu [data-lead]').forEach((el) => el.addEventListener('click', () => setMenu(false)));
window.addEventListener('keydown', (e) => { if (e.key === 'Escape') setMenu(false); });

/* ---------- Контакти: посилання й тексти з CONTACTS; поки порожньо — ведуть до форми ---------- */
const finalName = document.querySelector('.case__form input[name="name"]');
document.querySelectorAll('[data-contact]').forEach((a) => {
  const kind = a.dataset.contact;
  const value = CONTACTS[kind];
  if (value) {
    a.href = kind === 'phone' ? `tel:${value.replace(/[^+\d]/g, '')}` : value;
    if (kind !== 'phone') { a.target = '_blank'; a.rel = 'noopener'; }
    if (a.dataset.fill === 'phone') a.textContent = value;
    if (a.dataset.fill === 'telegram') a.textContent = `@${value.split('/').pop()}`;
    return;
  }
  a.addEventListener('click', (e) => {
    e.preventDefault();
    if (a.closest('.final')) finalName.focus();
    else openLead();
  });
});

/* ---------- Послуги: вкладки папки ---------- */
const folderTabs = [...document.querySelectorAll('.folder__tab')];
folderTabs.forEach((tab) => tab.addEventListener('click', () => {
  folderTabs.forEach((t) => {
    t.classList.toggle('is-active', t === tab);
    t.setAttribute('aria-selected', String(t === tab));
  });
  document.querySelectorAll('[data-doc]').forEach((doc) => {
    const show = doc.dataset.doc === tab.dataset.tab;
    doc.hidden = !show;
    doc.classList.toggle('is-active', show);
    if (show && !reduced) {
      doc.classList.remove('is-entering');
      void doc.offsetWidth;
      doc.classList.add('is-entering');
    }
  });
}));

/* ---------- Клієнти: полиця з папками, відкриваються лише по кліку ---------- */
const spines = [...document.querySelectorAll('.spine')];
spines.forEach((spine) => spine.querySelector('.spine__btn').addEventListener('click', () => {
  spines.forEach((sp) => {
    sp.classList.toggle('is-open', sp === spine);
    sp.querySelector('.spine__btn').setAttribute('aria-expanded', String(sp === spine));
  });
}));

/* ---------- Цінності: чи працюємо ми зараз (київський час, пн–пт до 17:00) ---------- */
const nowEl = document.querySelector('[data-now]');
if (nowEl) {
  const parts = Object.fromEntries(new Intl.DateTimeFormat('uk-UA', {
    timeZone: 'Europe/Kyiv', weekday: 'short', hour: '2-digit', minute: '2-digit', hourCycle: 'h23',
  }).formatToParts(new Date()).map((p) => [p.type, p.value]));
  const hour = +parts.hour;
  const weekend = ['сб', 'нд'].includes(parts.weekday.replace('.', ''));
  const working = !weekend && hour >= 9 && hour < 17;
  nowEl.textContent = working
    ? `${parts.hour}:${parts.minute} у Києві — ми на зв’язку`
    : `${parts.hour}:${parts.minute} у Києві — ми відпочиваємо, відповімо в робочий час`;
  nowEl.classList.toggle('is-off', !working);
  nowEl.hidden = false;
}

/* ---------- Скрол: шапка, стос документів, «болі», мобільна кнопка ---------- */
const header = document.querySelector('.header');
const stack = document.querySelector('[data-stack]');
const hero = document.querySelector('.hero');
const pains = [...document.querySelectorAll('[data-pains] li')];
const sticky = document.querySelector('.sticky-cta');
const heroCta = document.querySelector('.hero__cta');
const finalBox = document.querySelector('.case');
const day = document.querySelector('[data-day]');
const dayTrack = day && day.querySelector('.day__track');
const rules = day ? [...day.querySelectorAll('.rule')] : [];
const clockEl = day && day.querySelector('[data-clock]');
const clockLabel = day && day.querySelector('[data-clock-label]');
const hourHand = day && day.querySelector('.clock__hour');
const minHand = day && day.querySelector('.clock__min');
const pad = (n) => String(n).padStart(2, '0');

// Годинник блоку «Правила»: від 09:00 (540 хв) до 17:00 (1020 хв).
function setDay(minutes) {
  const m = Math.round(minutes);
  const h = Math.floor(m / 60);
  const mm = m % 60;
  clockEl.textContent = `${pad(h)}:${pad(mm)}`;
  hourHand.setAttribute('transform', `rotate(${((h % 12) + mm / 60) * 30} 200 200)`);
  minHand.setAttribute('transform', `rotate(${mm * 6} 200 200)`);
  day.style.setProperty('--p', ((m - 540) / 480).toFixed(4));
  const left = 1020 - m;
  clockLabel.textContent = m >= 1020 ? 'команда йде додому'
    : m < 600 ? 'робочий день почався'
    : `до кінця дня ${Math.floor(left / 60)} год ${pad(left % 60)} хв`;
  let current = 0;
  rules.forEach((r, i) => { if (m >= +r.dataset.at) current = i; });
  rules.forEach((r, i) => {
    r.classList.toggle('is-now', i === current);
    r.classList.toggle('is-past', i < current);
  });
  day.classList.toggle('is-evening', m >= 1020);
}

function onScroll() {
  const vh = window.innerHeight;
  header.classList.toggle('is-scrolled', window.scrollY > 10);

  // Під час скролу першого екрана аркуші розлітаються віялом.
  if (stack && !reduced && window.innerWidth > 760) {
    const p = clamp(window.scrollY / (hero.offsetHeight * 0.7));
    stack.style.setProperty('--s', p.toFixed(3));
  }

  // Біль перекреслюється, коли рядок доходить до середини екрана.
  pains.forEach((li) => {
    if (li.getBoundingClientRect().top < vh * 0.62) li.classList.add('is-done');
  });

  // Блок «Правила»: на десктопі годинник іде разом зі скролом, на мобільному — стрибає до правила в центрі екрана.
  if (day) {
    if (window.innerWidth > 1080 && !reduced) {
      const r = dayTrack.getBoundingClientRect();
      const p = clamp(-r.top / (dayTrack.offsetHeight - vh) / 0.88);
      setDay(540 + p * 480);
    } else {
      let at = 540;
      rules.forEach((rule) => { if (rule.getBoundingClientRect().top < vh * 0.6) at = +rule.dataset.at; });
      setDay(at);
    }
  }

  // Мобільна кнопка з’являється, коли кнопка першого екрана пішла з поля зору.
  // і ховається біля фінальної форми, щоб не перекривати її.
  sticky.classList.toggle('is-on', heroCta.getBoundingClientRect().bottom < 0 && finalBox.getBoundingClientRect().top > vh);
}

let ticking = false;
window.addEventListener('scroll', () => {
  if (ticking) return;
  ticking = true;
  requestAnimationFrame(() => { onScroll(); ticking = false; });
}, { passive: true });
window.addEventListener('resize', onScroll);
onScroll();

/* ---------- Легкий паралакс аркушів за курсором (лише десктоп) ---------- */
if (stack && !reduced && window.matchMedia('(hover: hover) and (pointer: fine)').matches) {
  hero.addEventListener('pointermove', (e) => {
    const r = hero.getBoundingClientRect();
    stack.style.setProperty('--mx', (((e.clientX - r.left) / r.width) * 2 - 1).toFixed(3));
    stack.style.setProperty('--my', (((e.clientY - r.top) / r.height) * 2 - 1).toFixed(3));
  });
}
