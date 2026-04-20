// ── NAV ──
const nav         = document.getElementById('nav');
const burger      = document.getElementById('burger');
const navLinks    = document.getElementById('navLinks');
const burgerSpans = burger.querySelectorAll('span');

const progress = document.getElementById('progress');
const vehicleImgWraps = [];

let scrollTotal = document.documentElement.scrollHeight - window.innerHeight;
window.addEventListener('resize', () => {
  scrollTotal = document.documentElement.scrollHeight - window.innerHeight;
}, { passive: true });

let rafPending = false;
function onScroll() {
  if (rafPending) return;
  rafPending = true;
  requestAnimationFrame(() => {
    rafPending = false;
    const scrolled = window.scrollY;

    progress.style.width = (scrolled / scrollTotal * 100) + '%';
    nav.classList.toggle('scrolled', scrolled > 60);

    // Skip hovered elements so CSS hover transition runs without JS overwriting it.
    if (parallaxEnabled && vehicleImgWraps.length) {
      const vh = window.innerHeight;
      for (const { wrap, img, hovered } of vehicleImgWraps) {
        if (hovered) continue;
        const rect = wrap.getBoundingClientRect();
        const center = rect.top + rect.height / 2 - vh / 2;
        img.style.transform = `scale(1.04) translateY(${center * 0.06}px)`;
      }
    }
  });
}

const parallaxEnabled = window.matchMedia('(prefers-reduced-motion: no-preference)').matches;
window.addEventListener('scroll', onScroll, { passive: true });

function setBurgerOpen(open) {
  burger.setAttribute('aria-expanded', open);
  burgerSpans[0].style.transform = open ? 'rotate(45deg) translate(5px, 5px)' : '';
  burgerSpans[1].style.opacity   = open ? '0' : '1';
  burgerSpans[2].style.transform = open ? 'rotate(-45deg) translate(5px, -5px)' : '';
}

burger.addEventListener('click', () => setBurgerOpen(navLinks.classList.toggle('open')));
navLinks.querySelectorAll('a').forEach(a => {
  a.addEventListener('click', () => {
    navLinks.classList.remove('open');
    setBurgerOpen(false);
  });
});

// ── HERO LOAD ──
window.addEventListener('load', () => {
  document.querySelector('.hero').classList.add('loaded');
}, { once: true });

// ── SCROLL REVEAL ──
const revealObserver = new IntersectionObserver(entries => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('visible');
      revealObserver.unobserve(entry.target);
    }
  });
}, { threshold: 0.1, rootMargin: '0px 0px -40px 0px' });

document.querySelectorAll('.reveal, .reveal-vehicle').forEach((el, i) => {
  el.style.transitionDelay = (i % 4) * 0.08 + 's';
  revealObserver.observe(el);
});

// ── ACTIVE NAV HIGHLIGHT ──
const sections = document.querySelectorAll('section[id]');
const navAnchors = navLinks.querySelectorAll('a');
const sectionObserver = new IntersectionObserver(entries => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      const id = entry.target.id;
      navAnchors.forEach(a => {
        a.style.color = a.getAttribute('href') === `#${id}` ? 'var(--gold)' : '';
      });
    }
  });
}, { threshold: 0, rootMargin: '-20% 0px -60% 0px' });
sections.forEach(s => sectionObserver.observe(s));

// ── PHONE CLOCK ──
const phoneTimeEl = document.getElementById('phoneTime');
const phoneLockTimeEl = document.getElementById('phoneLockTime');
function updateClock() {
  const now = new Date();
  const h = now.getHours() % 12 || 12;
  const t = h + ':' + String(now.getMinutes()).padStart(2, '0');
  if (phoneTimeEl) phoneTimeEl.textContent = t;
  if (phoneLockTimeEl) phoneLockTimeEl.textContent = t;
}
updateClock();
const clockInterval = setInterval(updateClock, 30000);
window.addEventListener('pagehide', () => clearInterval(clockInterval), { once: true });

// ── GTA PHONE — car selection ──
const phoneCars = document.querySelectorAll('.phone-car');

let activeCar = phoneCars[0] || null;

phoneCars.forEach(car => {
  car.addEventListener('click', () => {
    if (activeCar) activeCar.classList.remove('active');
    car.classList.add('active');
    activeCar = car;
  });
});

// ── SCROLL → PHONE ACTIVE STATE SYNC ──
const vehicleCards = document.querySelectorAll('.vehicle-card');
const cardObserver = new IntersectionObserver(entries => {
  entries.forEach(entry => {
    if (!entry.isIntersecting) return;
    const num = entry.target.dataset.num;
    const phoneEntry = document.querySelector(`.phone-car[data-car="${num}"]`);
    if (!phoneEntry || phoneEntry === activeCar) return;
    if (activeCar) activeCar.classList.remove('active');
    phoneEntry.classList.add('active');
    activeCar = phoneEntry;
    phoneEntry.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  });
}, { threshold: 0.5 });
vehicleCards.forEach(c => cardObserver.observe(c));

// ── TICKER — pause GPU compositing when off-screen ──
const tickerTrack = document.querySelector('.ticker__track');
if (tickerTrack) {
  const tickerObserver = new IntersectionObserver(([entry]) => {
    tickerTrack.style.animationPlayState = entry.isIntersecting ? 'running' : 'paused';
  }, { rootMargin: '100px 0px' });
  tickerObserver.observe(document.querySelector('.ticker'));
}

if (parallaxEnabled) {
  document.querySelectorAll('.vehicle-card__img:not(.vehicle-card__img--mystery)').forEach(img => {
    const wrap = img.closest('.vehicle-card__img-wrap');
    const entry = { wrap, img, hovered: false };
    vehicleImgWraps.push(entry);
    const card = img.closest('.vehicle-card');
    if (card) {
      card.addEventListener('mouseenter', () => { entry.hovered = true; img.style.transform = ''; });
      card.addEventListener('mouseleave', () => { entry.hovered = false; });
    }
  });
}

// ── PHONE LOCK SLIDER ──
const phoneLock = document.getElementById('phoneLock');
const phoneLockThumb = document.getElementById('phoneLockThumb');
const phoneLockTrack = document.getElementById('phoneLockTrack');

if (phoneLock && phoneLockThumb && phoneLockTrack) {
  const label = phoneLockTrack.querySelector('.phone-lock__label');
  let dragging = false, startX = 0, currentX = 0;
  const getMax = () => phoneLockTrack.offsetWidth - phoneLockThumb.offsetWidth - 10;
  const getClientX = e => e.touches ? e.touches[0].clientX : e.clientX;

  function lockDragStart(e) {
    dragging = true;
    startX = getClientX(e) - currentX;
    phoneLockThumb.style.transition = 'none';
  }
  function lockDragMove(e) {
    if (!dragging) return;
    const x = getClientX(e) - startX;
    currentX = Math.max(0, Math.min(x, getMax()));
    phoneLockThumb.style.transform = `translateX(${currentX}px)`;
    label.style.opacity = Math.max(0, 1 - (currentX / getMax()) * 1.8);
  }
  function lockDragEnd() {
    if (!dragging) return;
    dragging = false;
    phoneLockThumb.style.transition = 'transform 0.3s ease';
    if (currentX / getMax() >= 0.82) {
      phoneLockThumb.style.transform = `translateX(${getMax()}px)`;
      setTimeout(() => phoneLock.classList.add('unlocked'), 180);
    } else {
      currentX = 0;
      phoneLockThumb.style.transform = 'translateX(0)';
      label.style.opacity = '';
    }
  }

  phoneLockThumb.addEventListener('mousedown', lockDragStart);
  phoneLockThumb.addEventListener('touchstart', lockDragStart, { passive: true });
  window.addEventListener('mousemove', lockDragMove);
  window.addEventListener('touchmove', lockDragMove, { passive: true });
  window.addEventListener('mouseup', lockDragEnd);
  window.addEventListener('touchend', lockDragEnd);
}
