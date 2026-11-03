// Happy Finance — інтерактив сторінки.
document.documentElement.classList.add('js');

/* ---------- Поява першого екрана: після завантаження шрифту, щоб текст не стрибав ---------- */
const startHero = () => {
  if (document.documentElement.classList.contains('is-ready')) return;
  document.documentElement.classList.add('is-ready');
  document.querySelector('.hero [data-stamp]')?.classList.add('is-stamping');
  countFacts();
};

// Цифри під першим екраном м’яко нараховуються, коли з’являється їхній рядок.
// Ширину фіксуємо за кінцевим значенням, щоб сусідні показники не смикались.
function countFacts() {
  if (reduced) return;
  document.querySelectorAll('.hero [data-count]').forEach((el) => {
    const target = +el.dataset.count;
    el.style.minWidth = `${el.offsetWidth}px`;
    el.textContent = '0';
    const start = performance.now() + 750;
    const dur = 1600;
    const tick = (now) => {
      const t = clamp((now - start) / dur);
      el.textContent = Math.round(target * (1 - Math.pow(1 - t, 4)));
      if (t < 1) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  });
}
const wait = (ms) => new Promise((r) => setTimeout(r, ms));
const fontsReady = document.fonts ? Promise.race([document.fonts.ready, wait(900)]) : Promise.resolve();
const preloader = document.querySelector('.preloader');

// Прелоадер: тримаємо, доки домалюється монограма (≈1.3 с) і завантажиться шрифт,
// потім аркуш піднімається, а під ним уже стартує поява першого екрана.
const hidePreloader = () => {
  if (!preloader || !preloader.isConnected) return;
  preloader.classList.add('is-out');
  lenis?.start();
  setTimeout(startHero, 280);
  setTimeout(() => {
    preloader.remove();
    document.documentElement.classList.remove('is-pre');
  }, 900);
};
if (document.documentElement.classList.contains('is-pre') && preloader) {
  Promise.all([fontsReady, wait(1300)]).then(hidePreloader);
  setTimeout(hidePreloader, 3500); // запасний варіант
} else {
  preloader?.remove();
  fontsReady.then(startHero);
}
setTimeout(startHero, 4000); // запасний варіант, якщо шрифт вантажиться надто довго

// Контакти Марії Панченко (надіслав Дмитро 27.10).
const CONTACTS = {
  phone: '+380663568040',
  telegram: 'https://t.me/MariiaPanchenko_ua',
  instagram: 'https://instagram.com/Mariia_Panchenko_ua',
};

const clamp = (v, min = 0, max = 1) => Math.min(max, Math.max(min, v));
const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

/* ---------- Заявка: модалка (кнопки [data-lead]) і форма у фінальному блоці ---------- */
const lead = document.getElementById('lead');
/* ---------- Плавна прокрутка (лише десктоп з мишею; на телефоні — рідний скрол) ---------- */
let lenis = null;
if (window.Lenis && !reduced && window.matchMedia('(hover: hover) and (pointer: fine)').matches) {
  lenis = new Lenis({ lerp: 0.11, wheelMultiplier: 1 });
  const raf = (t) => { lenis.raf(t); requestAnimationFrame(raf); };
  if (document.documentElement.classList.contains('is-pre')) lenis.stop(); // поки йде прелоадер
  requestAnimationFrame(raf);
  // Якірні посилання меню — теж плавно, з відступом під шапку.
  document.addEventListener('click', (e) => {
    const a = e.target.closest('a[href^="#"]');
    if (!a || a.getAttribute('href').length < 2) return;
    const target = document.querySelector(a.getAttribute('href'));
    if (!target) return;
    e.preventDefault();
    lenis.scrollTo(target, { offset: -84, duration: 1.2 });
  });
}

const openLead = () => {
  lenis?.stop();
  lead.showModal();
  document.body.classList.add('lead-open');
};
document.querySelectorAll('[data-lead]').forEach((btn) => btn.addEventListener('click', openLead));
lead.querySelector('[data-close]').addEventListener('click', () => lead.close());
lead.addEventListener('click', (e) => { if (e.target === lead) lead.close(); });
lead.addEventListener('close', () => { document.body.classList.remove('lead-open'); lenis?.start(); });

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

/* ---------- Маска українського телефону: +38 (0XX) XXX XX XX ---------- */
// Лишаємо лише цифри номера (10 штук, починаючи з 0) і самі розставляємо пробіли й дужки.
// Вставлений «+380671234567», «380…» чи «067…» приводиться до одного вигляду.
const phoneDigits = (value) => {
  let d = value.replace(/\D/g, '');
  if (d.startsWith('380')) d = d.slice(2);
  else if (d.startsWith('38')) d = d.slice(2);
  if (d && d[0] !== '0') d = `0${d}`;
  return d.slice(0, 10);
};
const formatPhone = (d) => {
  if (!d) return '';
  let out = `+38 (${d.slice(0, 3)}`;
  if (d.length >= 3) out += `) ${d.slice(3, 6)}`;
  if (d.length >= 6) out += ` ${d.slice(6, 8)}`;
  if (d.length >= 8) out += ` ${d.slice(8, 10)}`;
  return out;
};
document.querySelectorAll('[data-phone]').forEach((input) => {
  let prev = '';
  input.addEventListener('focus', () => { if (!input.value) input.value = '+38 (0'; prev = '0'; });
  input.addEventListener('blur', () => { if (phoneDigits(input.value).length <= 1) input.value = ''; });
  input.addEventListener('input', (e) => {
    let d = phoneDigits(input.value);
    // Стерли дужку чи пробіл — стираємо й цифру перед ними, інакше курсор «застрягає».
    if (e.inputType === 'deleteContentBackward' && d === prev) d = d.slice(0, -1);
    input.value = d ? formatPhone(d) : '';
    prev = d;
    input.setCustomValidity('');
  });
  input.addEventListener('invalid', () => {
    input.setCustomValidity('Введіть номер повністю: +38 (0XX) XXX XX XX');
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

/* ---------- Команда: бейджі гойдаються, коли їх зачіпає курсор (лише десктоп) ---------- */
// Кожен бейдж — маятник із пружиною: рух миші дає поштовх, далі він сам загасає.
const badgeEls = [...document.querySelectorAll('.badge')];
if (badgeEls.length && !reduced && window.matchMedia('(hover: hover) and (pointer: fine)').matches) {
  const state = badgeEls.map(() => ({ a: 0, v: 0 }));
  let running = false;
  let last = 0;
  let lastX = null;
  let lastT = 0;

  const step = (now) => {
    const dt = Math.min((now - last) / 1000, 0.032);
    last = now;
    let moving = false;
    state.forEach((st, i) => {
      st.v += (-55 * st.a - 3.4 * st.v) * dt; // пружина + загасання
      st.a = clamp(st.a + st.v * dt, -7, 7);
      if (Math.abs(st.a) > 0.02 || Math.abs(st.v) > 0.05) moving = true;
      else { st.a = 0; st.v = 0; }
      badgeEls[i].style.setProperty('--swing', `${st.a.toFixed(2)}deg`);
    });
    running = moving;
    if (moving) requestAnimationFrame(step);
  };

  document.querySelector('[data-badges]').addEventListener('pointermove', (e) => {
    const now = performance.now();
    if (lastX !== null && now - lastT < 100) {
      const vx = clamp((e.clientX - lastX) / Math.max(now - lastT, 1), -3, 3); // px/мс
      const i = badgeEls.indexOf(e.target.closest('.badge'));
      if (i > -1) {
        // Рух вправо штовхає низ бейджа вправо, тобто поворот проти годинникової.
        state[i].v -= vx * 9;
        if (!running) { running = true; last = now; requestAnimationFrame(step); }
      }
    }
    lastX = e.clientX;
    lastT = now;
  });
}

/* ---------- Клієнти: полиця з папками, відкриваються лише по кліку ---------- */
const spines = [...document.querySelectorAll('.spine')];
spines.forEach((spine) => spine.querySelector('.spine__btn').addEventListener('click', () => {
  spines.forEach((sp) => {
    sp.classList.toggle('is-open', sp === spine);
    sp.querySelector('.spine__btn').setAttribute('aria-expanded', String(sp === spine));
  });
}));

/* ---------- Цінності: чи працюємо ми зараз (київський час, пн–пт до 17:00) ---------- */
// Київський час і чи працюємо зараз (пн–пт, 9:00–17:00).
function kyivNow() {
  const parts = Object.fromEntries(new Intl.DateTimeFormat('uk-UA', {
    timeZone: 'Europe/Kyiv', weekday: 'short', hour: '2-digit', minute: '2-digit', hourCycle: 'h23',
  }).formatToParts(new Date()).map((p) => [p.type, p.value]));
  const weekend = ['сб', 'нд'].includes(parts.weekday.replace('.', ''));
  return { time: `${parts.hour}:${parts.minute}`, working: !weekend && +parts.hour >= 9 && +parts.hour < 17 };
}
const now = kyivNow();

const nowEl = document.querySelector('[data-now]');
if (nowEl) {
  nowEl.textContent = now.working
    ? `${now.time} у Києві — ми на зв’язку`
    : `${now.time} у Києві — ми відпочиваємо, відповімо в робочий час`;
  nowEl.classList.toggle('is-off', !now.working);
  nowEl.hidden = false;
}

/* ---------- Часті питання: чат з Марією ---------- */
// Натиснули питання — воно «надсилається», Марія «друкує» і відповідає. Перше питання програється само, коли блок на екрані.
const faq = document.querySelector('[data-faq]');
let faqAsk = null;
let faqAutoDone = false;
if (faq) {
  const chatBody = faq.querySelector('[data-chat-body]');
  const chips = [...faq.querySelectorAll('.faq__chip')];
  const answers = [...faq.querySelectorAll('.faq__src dd')].map((dd) => dd.textContent);
  const status = faq.querySelector('[data-chat-status]');
  status.textContent = now.working ? 'на зв’язку до 17:00' : 'зараз відпочиває · відповість у робочий час';
  status.classList.toggle('is-off', !now.working);
  let busy = false;

  const toBottom = () => chatBody.scrollTo({ top: chatBody.scrollHeight, behavior: reduced ? 'auto' : 'smooth' });
  const add = (cls, text) => {
    const p = document.createElement('p');
    p.className = `msg ${cls}`;
    p.textContent = text;
    chatBody.append(p);
    toBottom();
    return p;
  };

  faqAsk = (i) => {
    if (busy) return;
    busy = true;
    faqAutoDone = true;
    chips.forEach((c, k) => c.classList.toggle('is-active', k === i));
    chips[i].classList.add('is-asked');
    add('msg--out', chips[i].textContent);
    const typing = add('msg--in msg--typing', '');
    typing.innerHTML = '<i></i><i></i><i></i>';
    typing.setAttribute('aria-label', 'Марія друкує');
    setTimeout(() => {
      typing.classList.remove('msg--typing');
      typing.removeAttribute('aria-label');
      typing.textContent = answers[i];
      toBottom();
      busy = false;
    }, reduced ? 0 : 700 + Math.min(answers[i].length * 3, 700));
  };
  chips.forEach((chip, i) => chip.addEventListener('click', () => faqAsk(i)));
}

/* ---------- Скрол: шапка, стос документів, «болі», мобільна кнопка ---------- */
const header = document.querySelector('.header');
const stack = document.querySelector('[data-stack]');
const hero = document.querySelector('.hero');
const pains = [...document.querySelectorAll('[data-pains] li')];
const heroCta = document.querySelector('.hero__cta');
const acts = document.querySelector('[data-acts]');
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

  // Кейси: штемпель ставить «Виконано» на кожен акт, коли блок доходить до екрана.
  if (acts && !acts.dataset.done && acts.getBoundingClientRect().top < vh * 0.7) {
    acts.dataset.done = '1';
    acts.querySelectorAll('[data-stamp]').forEach((st) => st.classList.add('is-stamping'));
  }

  // Чат з Марією: перше питання ставиться саме, коли блок доходить до екрана.
  if (faq && !faqAutoDone && faq.getBoundingClientRect().top < vh * 0.45) faqAsk(0);

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
