// ── NAV ──
const nav      = document.getElementById('nav');
const burger   = document.getElementById('burger');
const navLinks = document.getElementById('navLinks');
const progress = document.getElementById('progress');
const burgerSpans = burger.querySelectorAll('span');

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
  });
}
window.addEventListener('scroll', onScroll, { passive: true });

function setBurgerOpen(open) {
  burger.setAttribute('aria-expanded', open);
  burgerSpans[0].style.transform = open ? 'rotate(45deg) translate(5px, 5px)' : '';
  burgerSpans[1].style.opacity   = open ? '0' : '1';
  burgerSpans[2].style.transform = open ? 'rotate(-45deg) translate(5px, -5px)' : '';
}
burger.addEventListener('click', () => setBurgerOpen(navLinks.classList.toggle('open')));
navLinks.querySelectorAll('a').forEach(a => {
  a.addEventListener('click', () => { navLinks.classList.remove('open'); setBurgerOpen(false); });
});

// ── PHONE REVEAL ──
const phoneReveal = document.getElementById('phoneReveal');
let phoneTimer;
document.querySelectorAll('[data-action="contact"]').forEach(btn => {
  btn.addEventListener('click', () => {
    clearTimeout(phoneTimer);
    phoneReveal.classList.add('vip-toast--show');
    phoneTimer = setTimeout(() => phoneReveal.classList.remove('vip-toast--show'), 5000);
  });
});
window.addEventListener('pagehide', () => clearTimeout(phoneTimer), { once: true });

// ── VIP EASTER EGG ──
const vipToast = document.getElementById('vipToast');
const logoLink = document.querySelector('.nav__logo');
let logoClicks = 0, vipTimer;
logoLink.addEventListener('click', e => {
  e.preventDefault();
  if (++logoClicks >= 5) {
    logoClicks = 0;
    clearTimeout(vipTimer);
    vipToast.classList.add('vip-toast--show');
    vipTimer = setTimeout(() => vipToast.classList.remove('vip-toast--show'), 5000);
  }
});
window.addEventListener('pagehide', () => clearTimeout(vipTimer), { once: true });

// ── COMING SOON CARDS ──
const soonNames = ['Lamborghini Urus','Ferrari 488','Porsche 911 GT3','McLaren 720S','Rolls-Royce Ghost','Bentley Continental','Mercedes AMG GT'];
const fleetGrid = document.querySelector('.fleet__grid');
soonNames.forEach((name, i) => {
  const card = document.createElement('div');
  card.className = 'car-card car-card--soon reveal';
  card.dataset.num = i + 2;
  card.innerHTML = `
    <div class="car-card__img-wrap">
      <div class="car-card__img car-card__img--soon"></div>
      <div class="car-card__soon-badge">Coming Soon</div>
    </div>
    <div class="car-card__info">
      <h3 class="car-card__name car-card__name--blur">${name}</h3>
      <div class="car-card__footer">
        <div class="car-card__price car-card__price--blur"><sup>$</sup>000<span>/day</span></div>
      </div>
    </div>`;
  fleetGrid.appendChild(card);
});

// ── SCROLL REVEAL ──
const revealObserver = new IntersectionObserver(entries => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('visible');
      revealObserver.unobserve(entry.target);
    }
  });
}, { threshold: 0.08, rootMargin: '0px 0px -40px 0px' });

document.querySelectorAll('.reveal').forEach((el, i) => {
  el.style.transitionDelay = (i % 5) * 0.07 + 's';
  revealObserver.observe(el);
});

// ── ACTIVE NAV HIGHLIGHT ──
const sections   = document.querySelectorAll('section[id]');
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

// ── LANGUAGE PICKER ──
const langPicker   = document.getElementById('langPicker');
const langBtn      = document.getElementById('langBtn');
const langLabel    = document.getElementById('langLabel');
const langDropdown = document.getElementById('langDropdown');

langBtn.addEventListener('click', e => {
  e.stopPropagation();
  langPicker.classList.toggle('lang-picker--open');
});
document.addEventListener('click', () => langPicker.classList.remove('lang-picker--open'));

const langOptions = langDropdown.querySelectorAll('.lang-picker__option');
langOptions.forEach(opt => {
  opt.addEventListener('click', () => {
    const lang = opt.dataset.lang;
    langLabel.textContent = opt.textContent.trim();
    langOptions.forEach(o => o.classList.remove('lang-picker__option--active'));
    opt.classList.add('lang-picker__option--active');
    langPicker.classList.remove('lang-picker--open');

    const select = document.querySelector('#google_translate_element select');
    if (select) {
      select.value = lang;
      select.dispatchEvent(new Event('change'));
    }
  });
});

