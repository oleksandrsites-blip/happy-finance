// Happy Finance — інтерактив сторінки.
document.documentElement.classList.add('js');

const clamp = (v, min = 0, max = 1) => Math.min(max, Math.max(min, v));
const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

/* ---------- Форма заявки: одна на весь сайт, відкривається будь-якою кнопкою [data-lead] ---------- */
const lead = document.getElementById('lead');
const form = lead.querySelector('[data-form]');
const formWrap = lead.querySelector('[data-form-wrap]');
const done = lead.querySelector('[data-done]');
const hint = lead.querySelector('[data-hint]');

document.querySelectorAll('[data-lead]').forEach((btn) => btn.addEventListener('click', () => {
  lead.showModal();
  document.body.classList.add('lead-open');
}));
lead.querySelector('[data-close]').addEventListener('click', () => lead.close());
lead.addEventListener('click', (e) => { if (e.target === lead) lead.close(); });
lead.addEventListener('close', () => document.body.classList.remove('lead-open'));

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
    formWrap.hidden = true;
    done.hidden = false;
  } catch {
    btn.disabled = false;
    hint.textContent = 'Не вдалося надіслати. Спробуйте ще раз за хвилину.';
    hint.classList.add('is-error');
  }
});

/* ---------- Скрол: шапка, стос документів, «болі», мобільна кнопка ---------- */
const header = document.querySelector('.header');
const stack = document.querySelector('[data-stack]');
const hero = document.querySelector('.hero');
const pains = [...document.querySelectorAll('[data-pains] li')];
const sticky = document.querySelector('.sticky-cta');
const heroCta = document.querySelector('.hero__cta');

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

  // Мобільна кнопка з’являється, коли кнопка першого екрана пішла з поля зору.
  sticky.classList.toggle('is-on', heroCta.getBoundingClientRect().bottom < 0);
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
