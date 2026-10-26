// Happy Finance — інтерактив сторінки.
document.documentElement.classList.add('js');

// Контакти клієнтки: поки невідомі, заповнити коли надішле Дмитро.
const CONTACTS = {
  phone: '',      // '+380XXXXXXXXX'
  telegram: '',   // 'https://t.me/username'
  instagram: '',  // 'https://instagram.com/username'
};

const clamp = (v, min = 0, max = 1) => Math.min(max, Math.max(min, v));
const vh = () => window.innerHeight;

/* ---------- Контакти ---------- */
document.querySelectorAll('[data-contact]').forEach((a) => {
  const value = CONTACTS[a.dataset.contact];
  if (!value) {
    if (a.dataset.contact !== 'phone') a.href = '#contact';
    return;
  }
  a.href = a.dataset.contact === 'phone' ? `tel:${value}` : value;
  if (a.dataset.contact !== 'phone') { a.target = '_blank'; a.rel = 'noopener'; }
});

/* ---------- Шапка та мобільне меню ---------- */
const header = document.querySelector('.header');
const burger = document.getElementById('burger');
let lastY = window.scrollY;

function onHeaderScroll() {
  const y = window.scrollY;
  header.classList.toggle('is-scrolled', y > 20);
  const menuOpen = document.body.classList.contains('menu-open');
  header.classList.toggle('is-hidden', !menuOpen && y > lastY && y > 400);
  lastY = y;
}

burger.addEventListener('click', () => {
  const open = document.body.classList.toggle('menu-open');
  burger.setAttribute('aria-expanded', String(open));
});
document.querySelectorAll('.nav a').forEach((a) => a.addEventListener('click', () => {
  document.body.classList.remove('menu-open');
  burger.setAttribute('aria-expanded', 'false');
}));

/* ---------- Поява блоків (за позицією скролу, а не IntersectionObserver — так не пропускає блоки при швидкому свайпі) ---------- */
const reveals = [...document.querySelectorAll('.reveal')];
function onReveal() {
  const limit = vh() * 0.9;
  for (let i = reveals.length - 1; i >= 0; i--) {
    const el = reveals[i];
    if (el.getBoundingClientRect().top < limit) {
      el.classList.add('is-in');
      reveals.splice(i, 1);
    }
  }
}

/* ---------- Лічильники ---------- */
const counters = [...document.querySelectorAll('[data-count]')];
function runCounter(el) {
  const target = +el.dataset.count;
  const suffix = el.dataset.suffix || '';
  const start = performance.now();
  const dur = 1600;
  const tick = (now) => {
    const t = clamp((now - start) / dur);
    const eased = 1 - Math.pow(1 - t, 3);
    el.textContent = Math.round(target * eased) + suffix;
    if (t < 1) requestAnimationFrame(tick);
  };
  requestAnimationFrame(tick);
}
function onCounters() {
  for (let i = counters.length - 1; i >= 0; i--) {
    if (counters[i].getBoundingClientRect().top < vh() * 0.95) {
      runCounter(counters[i]);
      counters.splice(i, 1);
    }
  }
}

/* ---------- Маніфест: слова підсвічуються під час скролу ---------- */
const manifesto = document.querySelector('[data-words]');
let words = [];
if (manifesto) {
  const wrap = (node) => {
    [...node.childNodes].forEach((child) => {
      if (child.nodeType === Node.TEXT_NODE) {
        const frag = document.createDocumentFragment();
        child.textContent.split(/(\s+)/).forEach((part) => {
          if (!part) return;
          if (/^\s+$/.test(part)) { frag.append(part); return; }
          const s = document.createElement('span');
          s.className = 'w';
          s.textContent = part;
          frag.append(s);
        });
        child.replaceWith(frag);
      } else {
        wrap(child);
      }
    });
  };
  wrap(manifesto);
  words = [...manifesto.querySelectorAll('.w')];
}
function onManifesto() {
  if (!manifesto) return;
  const r = manifesto.getBoundingClientRect();
  const p = clamp((vh() * 0.8 - r.top) / (r.height + vh() * 0.25));
  const lit = Math.round(p * words.length);
  words.forEach((w, i) => w.classList.toggle('is-on', i < lit));
}

/* ---------- Підхід: лінія кроків заповнюється ---------- */
const steps = document.querySelector('[data-steps]');
const stepItems = steps ? [...steps.querySelectorAll('.step')] : [];
function onSteps() {
  if (!steps) return;
  const r = steps.getBoundingClientRect();
  const p = clamp((vh() * 0.75 - r.top) / (r.height * 0.9));
  steps.style.setProperty('--p', p.toFixed(3));
  stepItems.forEach((s, i) => s.classList.toggle('is-lit', p >= i / stepItems.length + 0.02));
}

/* ---------- Спільний обробник скролу ---------- */
let ticking = false;
function onScroll() {
  if (ticking) return;
  ticking = true;
  requestAnimationFrame(() => {
    onHeaderScroll();
    onReveal();
    onCounters();
    onManifesto();
    onSteps();
    ticking = false;
  });
}
window.addEventListener('scroll', onScroll, { passive: true });
window.addEventListener('resize', onScroll);
onScroll();

/* ---------- Послуги: перемикач ФОП / ТОВ і акордеон ---------- */
const switchEl = document.querySelector('.switch');
const pill = switchEl.querySelector('.switch__pill');
const tabs = [...switchEl.querySelectorAll('.switch__btn')];

function placePill(btn) {
  pill.style.width = `${btn.offsetWidth}px`;
  pill.style.transform = `translateX(${btn.offsetLeft - 5}px)`;
}
tabs.forEach((btn) => btn.addEventListener('click', () => {
  const tab = btn.dataset.tab;
  tabs.forEach((b) => {
    b.classList.toggle('is-active', b === btn);
    b.setAttribute('aria-selected', String(b === btn));
  });
  placePill(btn);
  document.querySelectorAll('[data-note]').forEach((n) => { n.hidden = n.dataset.note !== tab; });
  document.querySelectorAll('[data-panel]').forEach((panel) => {
    const show = panel.dataset.panel === tab;
    panel.hidden = !show;
    if (show) {
      panel.classList.remove('is-entering');
      void panel.offsetWidth;
      panel.classList.add('is-entering');
    }
  });
}));
placePill(tabs[0]);
window.addEventListener('resize', () => placePill(switchEl.querySelector('.is-active')));
document.fonts && document.fonts.ready.then(() => placePill(switchEl.querySelector('.is-active')));

document.querySelectorAll('.acc__head').forEach((head) => head.addEventListener('click', () => {
  const item = head.parentElement;
  const open = !item.classList.contains('is-open');
  item.parentElement.querySelectorAll('.acc__item.is-open').forEach((o) => {
    o.classList.remove('is-open');
    o.querySelector('.acc__head').setAttribute('aria-expanded', 'false');
  });
  item.classList.toggle('is-open', open);
  head.setAttribute('aria-expanded', String(open));
}));

/* ---------- Квіз ---------- */
const quiz = document.querySelector('[data-quiz]');
if (quiz) {
  const stepsQ = [...quiz.querySelectorAll('.quiz__step')];
  const progress = quiz.querySelector('.quiz__progress');
  const finish = quiz.querySelector('[data-finish]');
  const recsEl = quiz.querySelector('[data-recs]');
  const form = quiz.querySelector('[data-form]');
  const done = quiz.querySelector('[data-done]');
  const summary = quiz.querySelector('[data-quiz-summary]');

  const go = (n) => {
    stepsQ.forEach((s) => s.classList.toggle('is-active', +s.dataset.step === n));
    progress.style.setProperty('--p', `${((n - 1) / 3) * 100}%`);
  };

  quiz.querySelectorAll('input[type="radio"]').forEach((input) => input.addEventListener('change', () => {
    const next = +input.closest('.quiz__step').dataset.step + 1;
    setTimeout(() => go(next), 320);
  }));

  const needs = [...quiz.querySelectorAll('input[name="q-need"]')];
  needs.forEach((n) => n.addEventListener('change', () => {
    finish.disabled = !needs.some((x) => x.checked);
  }));

  const NEED_RECS = {
    taxes: ['Звітність і контроль податків', 'Звіти, реквізити, ліміти — без стресу і штрафів'],
    docs: ['Первинні документи', 'Рахунки, акти, накладні та шаблони договорів'],
    bank: ['Фінмоніторинг у банку', 'Пояснення й документи для перевірки будь-якої складності'],
    close: ['Закриття або зміни ФОП', 'Закриття без «хвостів», зміна КВЕДів онлайн'],
  };

  finish.addEventListener('click', () => {
    const type = quiz.querySelector('input[name="q-type"]:checked')?.value;
    const staff = quiz.querySelector('input[name="q-staff"]:checked')?.value;
    const picked = needs.filter((n) => n.checked).map((n) => n.value);
    const recs = [];

    if (type === 'ФОП') recs.push(['Щомісячний супровід ФОП', 'Податки, звіти, книга доходів, контроль ліміту']);
    if (type === 'ТОВ') recs.push(['Повний бухгалтерський супровід ТОВ', 'З ПДВ і без, експорт та імпорт']);
    if (type === 'Ще не зареєстровані') recs.push(['Відкриття ФОП або ТОВ', 'Підберемо форму, КВЕДи й систему оподаткування']);
    if (staff !== 'Ні') recs.push(['Кадровий облік', 'Договори, зарплата, лікарняні, звіти']);
    if (picked.includes('numbers')) {
      recs.push(type === 'ТОВ'
        ? ['Управлінський облік', 'P&L, Cashflow, Balance — цифри для рішень']
        : ['Фінансовий супровід', 'Облік у CRM, фінансові звіти, бізнес-процеси']);
    }
    picked.forEach((p) => NEED_RECS[p] && recs.push(NEED_RECS[p]));

    recsEl.innerHTML = '';
    recs.forEach(([title, note], i) => {
      const li = document.createElement('li');
      li.style.animationDelay = `${i * 70}ms`;
      li.innerHTML = `<div><b></b><span></span></div>`;
      li.querySelector('b').textContent = title;
      li.querySelector('span').textContent = note;
      recsEl.append(li);
    });

    const labels = needs.filter((n) => n.checked).map((n) => n.nextElementSibling.textContent);
    summary.value = `${type}; працівники: ${staff}; важливо: ${labels.join(', ')}`;
    go(4);
    progress.style.setProperty('--p', '100%');
  });

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const btn = form.querySelector('button[type="submit"]');
    btn.disabled = true;
    try {
      const res = await fetch('/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams(new FormData(form)).toString(),
      });
      if (!res.ok) throw new Error(res.status);
      form.hidden = true;
      done.hidden = false;
    } catch {
      btn.disabled = false;
      btn.textContent = 'Не вдалося надіслати — спробуйте ще раз';
    }
  });

  quiz.querySelector('[data-restart]').addEventListener('click', () => {
    quiz.querySelectorAll('input[type="radio"], input[type="checkbox"]').forEach((i) => { i.checked = false; });
    finish.disabled = true;
    form.hidden = false;
    done.hidden = true;
    go(1);
  });
}
